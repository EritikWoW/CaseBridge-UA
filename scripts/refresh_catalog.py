"""Collect public source metadata; never automatically approve service changes.

Standard library only. Exact seeds, robots compliance, bounded downloads, no
credentials, no user case data, no broad crawl. Run from the repository root.
"""
import hashlib
import json
import re
import sys
import time
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlsplit, urlunsplit
from urllib.request import Request, build_opener, HTTPRedirectHandler
from urllib.robotparser import RobotFileParser

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / 'dist/data/catalog.json'
QUEUE = ROOT / 'data/review-queue.json'
AGENT = 'CaseBridgeCatalog/1.0 (+https://github.com/EritikWoW/CaseBridge-UA)'
HOSTS = {'legalaid.gov.ua', 'guide.diia.gov.ua', 'help.unhcr.org'}
LIMIT = 2_000_000
SEEDS = {
    'bpd': 'https://legalaid.gov.ua/',
    'diia': 'https://guide.diia.gov.ua/event/vnutrishno-peremishchena-osoba-6b312726-76e0-402f-9bcf-db880d7a2443',
    'unhcr': 'https://help.unhcr.org/ukraine/uk/ukraine-uk-where-to-seek-help-ua/legal-aid-in-ukraine-ua/',
}


def safe_url(url):
    p = urlsplit(url)
    return p.scheme == 'https' and p.hostname in HOSTS and not p.username and not p.password and p.port in (None, 443)


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        # Do not follow unchecked destinations or bypass their robots policies.
        raise ValueError('redirect_requires_review')


def download(url):
    if not safe_url(url):
        raise ValueError('url_not_allowed')
    req = Request(url, headers={'User-Agent': AGENT, 'Accept': 'text/html,text/plain', 'Accept-Encoding': 'identity'})
    with build_opener(NoRedirect).open(req, timeout=18) as res:
        if res.headers.get_content_type() not in ('text/html', 'text/plain'):
            raise ValueError('unsupported_content_type')
        body = res.read(LIMIT + 1)
        if len(body) > LIMIT:
            raise ValueError('response_too_large')
        return body.decode(res.headers.get_content_charset() or 'utf-8', errors='replace')


def robots_permit(url):
    p = urlsplit(url)
    robots_url = f'{p.scheme}://{p.netloc}/robots.txt'
    try:
        text = download(robots_url)
    except HTTPError as exc:
        if exc.code == 404:
            return True
        raise ValueError('robots_unavailable') from exc
    rules = RobotFileParser()
    rules.parse(text.splitlines())
    delay = rules.crawl_delay(AGENT) or rules.crawl_delay('*') or 0
    if delay > 30:
        raise ValueError('crawl_delay_requires_review')
    if not rules.can_fetch(AGENT, url):
        return False
    if delay:
        time.sleep(delay)
    return True


class MetadataParser(HTMLParser):
    def __init__(self, url):
        super().__init__(convert_charrefs=True)
        self.url = url
        self.title = []
        self.in_title = False
        self.suppressed = 0
        self.parts = []
        self.links = []
        self.anchor = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ('script', 'style', 'noscript'):
            self.suppressed += 1
        if tag == 'title':
            self.in_title = True
        if tag == 'a' and not self.suppressed:
            self.anchor = [attrs.get('href', ''), []]

    def handle_endtag(self, tag):
        if tag in ('script', 'style', 'noscript'):
            self.suppressed = max(0, self.suppressed - 1)
        if tag == 'title':
            self.in_title = False
        if tag == 'a' and self.anchor:
            href, chunks = self.anchor
            self.anchor = None
            parsed = urlsplit(urljoin(self.url, href))
            link = urlunsplit((parsed.scheme, parsed.netloc, parsed.path, '', ''))
            label = ' '.join(' '.join(chunks).split())[:180]
            if safe_url(link) and label and re.search(r'допом|прав|документ|виплат|житл|переміщ|legal|aid|service', label, re.I):
                self.links.append({'url': link, 'title': label})

    def handle_data(self, text):
        if self.suppressed:
            return
        if self.in_title:
            self.title.append(text)
        self.parts.append(text)
        if self.anchor:
            self.anchor[1].append(text)

    def result(self):
        # Persist only metadata and a digest, not a copy of the source article.
        text = ' '.join(' '.join(self.parts).split())
        title = ' '.join(' '.join(self.title).split())[:200]
        if len(text) < 100 or not title or re.search(r'just a moment|access denied|captcha|forbidden', title, re.I):
            raise ValueError('page_requires_review')
        links = list({item['url']: item for item in self.links}.values())[:20]
        return {'title': title, 'fingerprint': hashlib.sha256(text.encode()).hexdigest(), 'links': links}


def observe(source, metadata, now):
    old = source.get('fingerprint')
    source.update(status='available', checked_at=now, last_success_at=now, title=metadata['title'], fingerprint=metadata['fingerprint'], error=None)
    if old and old != metadata['fingerprint']:
        source['review_required'] = True
    # The initial snapshot is a baseline, NOT a legal/content approval.
    return bool(old and old != metadata['fingerprint'])


def atomic_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix('.tmp')
    tmp.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    tmp.replace(path)


def refresh():
    catalog = json.loads(CATALOG.read_text(encoding='utf-8'))
    queue = json.loads(QUEUE.read_text(encoding='utf-8')) if QUEUE.exists() else {'candidates': [], 'changes': []}
    now = datetime.now(timezone.utc).isoformat()
    candidates = {item['url']: item for item in queue['candidates']}
    approved_urls = {e['url'] for e in catalog['entries']}
    successes = 0
    for source in catalog['sources']:
        source['checked_at'] = now
        try:
            if source['url'] != SEEDS[source['id']]:
                raise ValueError('seed_mismatch')
            if not robots_permit(source['url']):
                source.update(status='blocked', error='robots_disallow')
                continue
            parser = MetadataParser(source['url'])
            parser.feed(download(source['url']))
            metadata = parser.result()
            if observe(source, metadata, now):
                queue['changes'].append({'source_id': source['id'], 'observed_at': now, 'fingerprint': metadata['fingerprint'], 'status': 'pending_review'})
            for item in metadata['links']:
                if item['url'] not in approved_urls and item['url'] not in candidates:
                    candidates[item['url']] = {**item, 'source_id': source['id'], 'discovered_at': now, 'status': 'pending_review'}
            successes += 1
        except (HTTPError, URLError, ValueError, TimeoutError, OSError) as exc:
            source.update(status='unavailable', error=type(exc).__name__)
            # Keep prior successful observation and all reviewed descriptions.
        print(source['id'], source['status'])
    catalog['updated_at'] = now
    queue['candidates'] = list(candidates.values())[-300:]
    queue['changes'] = queue['changes'][-100:]
    queue['updated_at'] = now
    atomic_json(CATALOG, catalog)
    atomic_json(QUEUE, queue)
    print(f'Collected {successes}/{len(catalog["sources"])} sources; {len(queue["candidates"])} candidates await review.')
    return successes


if __name__ == '__main__':
    refresh()
