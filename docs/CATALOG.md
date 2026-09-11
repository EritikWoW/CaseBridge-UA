# Catalog maintenance

## Sources and scope

- `legalaid.gov.ua`: public Free Legal Aid information and an official office-directory link.
- `guide.diia.gov.ua`: the public IDP service index. Its developer documentation also describes private administrative systems; this collector does not access those systems. The public guide states CC BY 4.0 unless otherwise indicated; cards attribute and link back to the source.
- `help.unhcr.org`: Ukraine legal-assistance information and public partner contacts.
- `osvita.diia.gov.ua`: education series, career preparation, and digital-hub directory links.
- `howareu.com`: directories of online mental-health support and community service providers, without copied clinical recommendations.

Only the five exact seed pages are fetched. No login, personal records, scraping of individual cases, external redirects, or automatic crawling of discovered links. Collection respects robots.txt, timeouts, size limits, and a descriptive user agent. A refusal or unavailable robots policy is not bypassed. The observation concerns the seed page; a linked subpage is not claimed to have passed an automated check.

## Review boundary

`dist/data/catalog.json` contains approved referral descriptions and source observations. `data/review-queue.json` contains unapproved discoveries and content-change observations. The latter is never loaded by the user-facing app. The collector never changes eligibility, recommended actions, phone numbers, translations, or approval flags.

To approve a candidate, open the original source, verify its current description, audience and coverage, then deliberately add a bilingual entry with the source ID, HTTPS URL and actual review date. Use `approved: false` to withdraw a referral. Never infer geographical coverage from an office address.

To resolve a changed source, review affected entries, update their descriptions and review dates if warranted, then set that source's `review_required` to false. Repeated collection of unchanged content does not clear an unresolved flag. An HTTP 200 means page availability only, not a legal review.

## Failure behavior

Unavailable sources retain their last successful date. Changed, unavailable, uncollected, or stale sources display a warning. Records older than 30 days require confirmation; page checks older than seven days also require confirmation. The interface retains a bundled catalog when public GitHub is unavailable, and the basic BPD contact still works if the catalog cannot load.

The collector keeps at most 300 candidate URLs and 100 change events; Git history retains earlier versions. A successful workflow means the collection attempt completed: inspect each source status for partial failures. No claim is made that pending candidates have been verified.

## Security and privacy

Matching happens locally. Catalog fetches are fixed GET requests without intake fields, credentials or referrers. The client validates the schema, approved flag and exact source-host allowlist; rendered text uses `textContent`. The only outbound case-related actions are user-initiated downloads/copy and normal navigation to a provider's website.

GitHub Actions requires contents-write permission to commit the two generated JSON files. The job does not hold Sites credentials and cannot deploy source changes. Source code changes still require a normal reviewed publication.
