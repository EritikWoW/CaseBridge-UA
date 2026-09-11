# CaseBridge UA

CaseBridge UA is a privacy-first legal navigation prototype for people in Ukraine. It turns a plain-language description of a problem into a clear first-action route, a preparation checklist, verified public support contacts, and a copy-ready draft request.

Built for **GatewayHacks 2026** in the **Open Impact & Community** track.

## Why it matters

People in stressful situations often do not know the legal name of their problem, which institution is responsible, or what to prepare before asking for help. CaseBridge UA starts with the person's own words and bridges the gap between a lived problem and the existing public legal-aid system.

## Prototype flow

1. Describe the situation or start from a common topic.
2. Add only routing context: region, deadline, relevant status, and safety risk.
3. Mark which evidence is already available.
4. Receive an ordered action plan and a structured draft request.

The intake runs in the browser and does not transmit or retain entered information. The browser downloads a public help catalog from this repository; those requests contain no intake answers.

## Safety and scope

- Emergency risk is escalated before the regular legal route.
- Official Free Legal Aid contacts link to [legalaid.gov.ua](https://legalaid.gov.ua/).
- The product supports navigation and preparation; it does not replace a lawyer or provide legal conclusions.
- Sample routing is deterministic for the hackathon demo. A production system would require reviewed legal content, secure infrastructure, consent, and an auditable retrieval pipeline.

## Run locally

Serve the `dist` directory with any static web server, for example:

```bash
python -m http.server 8080 --directory dist
```

Then open `http://localhost:8080`.

## Tech

Vanilla HTML, CSS, and JavaScript. No build step, account, API key, or backend is required for the prototype.

## Edition 02

- Redesigned civic workspace with progress transitions, a drawn completion check, and subtle pointer-responsive demo cards. Reduced-motion settings are respected.
- Three explicitly fictional, bilingual cases: a rental deposit, paused IDP payments, and unpaid wages. Each includes context and selected materials.
- Topic-specific consultation preparation, deadline awareness, a materials summary, editable intake, copy, local text download, and print/PDF support.
- Complete region selector, reversible UA/EN interface, keyboard focus management, and confirmation before replacing an intake.
- No account, analytics, remote AI, persistent case storage, or automatic submission. Exports are user-initiated and may contain whatever the user entered.
- Cases and topic guidance are demonstration templates, not expert-reviewed legal playbooks. Contact details should be confirmed with the official source.

### Checks

```bash
node --test tests/*.test.cjs
python -m unittest discover -s tests -p 'test_*.py'
```

These checks cover demo-data integrity, input validation, source references, privacy-related API use, syntax, and accessibility-related CSS guards. They are not a substitute for browser, screen-reader, or legal-content review.

## Public help catalog

The results match the selected topic and IDP status to reviewed source links from Free Legal Aid, Guide Diia, and UNHCR Ukraine. These are referrals and information pages, not eligibility decisions or verified nearby appointments. Region selection is used to explain the office-directory next step; no geographical distance is invented.

`scripts/refresh_catalog.py` downloads public seed pages after checking robots rules. It extracts titles and candidate links, fingerprints source text, and updates availability observations. It does not follow discovered links, use private APIs, copy full articles, or send case data anywhere. Automated availability checks and editorial description dates are separate.

The `Refresh public help catalog` GitHub Actions workflow runs daily at 06:23 UTC, on relevant code changes, or manually. It commits only catalog observations and the review queue. GitHub may delay schedules or disable scheduled runs after prolonged repository inactivity.

The live site reads `dist/data/catalog.json` from this public repository on page load or when the user refreshes the catalog, with a bundled fallback. A failed source check keeps prior observations and displays a warning; a changed source stays flagged until reviewed. This updates catalog data without republishing the application.

To collect locally:

```bash
python scripts/refresh_catalog.py
```

See [catalog maintenance](docs/CATALOG.md) for review and failure handling.

## License

MIT
