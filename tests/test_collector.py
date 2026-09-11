import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('collector', Path(__file__).resolve().parents[1] / 'scripts/refresh_catalog.py')
collector = importlib.util.module_from_spec(spec)
spec.loader.exec_module(collector)


class CollectorTests(unittest.TestCase):
    def test_exact_public_hosts_only(self):
        for url in ['http://legalaid.gov.ua/', 'https://evil.example/', 'https://legalaid.gov.ua.evil.example/', 'https://user:pass@legalaid.gov.ua/', 'https://127.0.0.1/', 'https://legalaid.gov.ua:444/']:
            self.assertFalse(collector.safe_url(url))
        self.assertTrue(collector.safe_url('https://legalaid.gov.ua/'))

    def test_extraction_ignores_scripts_and_does_not_follow_links(self):
        parser = collector.MetadataParser('https://legalaid.gov.ua/')
        parser.feed('<html><title>Правова допомога</title><script>secret()</script><main>' + 'Опис допомоги громадянам. ' * 10 + '<a href="/help/?tracking=1#section">Правова допомога</a><a href="https://evil.example/">Правова допомога</a></main></html>')
        result = parser.result()
        self.assertEqual(result['links'], [{'url':'https://legalaid.gov.ua/help/','title':'Правова допомога'}])
        self.assertNotIn('secret', str(result))
        self.assertNotIn('text', result)

    def test_changed_source_stays_flagged_until_review(self):
        source = {'fingerprint':'old', 'review_required':False}
        metadata = {'title':'Source', 'fingerprint':'new'}
        self.assertTrue(collector.observe(source, metadata, '2026-09-10T12:00:00Z'))
        self.assertTrue(source['review_required'])
        self.assertFalse(collector.observe(source, metadata, '2026-09-11T12:00:00Z'))
        self.assertTrue(source['review_required'])

    def test_initial_snapshot_is_not_review_approval(self):
        source = {}
        collector.observe(source, {'title':'Source','fingerprint':'new'}, '2026-09-10T12:00:00Z')
        self.assertNotIn('reviewed_at', source)
        self.assertNotIn('approved', source)

    def test_error_pages_not_treated_as_content(self):
        parser = collector.MetadataParser('https://legalaid.gov.ua/')
        parser.feed('<title>Access denied</title>' + 'Please wait ' * 50)
        with self.assertRaises(ValueError):
            parser.result()


if __name__ == '__main__':
    unittest.main()
