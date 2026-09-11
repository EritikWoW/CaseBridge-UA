# CaseBridge UA

CaseBridge UA is a privacy-first support navigator for people in Ukraine. Explore official and public support resources without filling in a form, collect useful contacts, and turn them into a personal action plan. A separate legal-route tool prepares an initial consultation and a copy-ready draft request.

Built for **GatewayHacks 2026** in the **Open Impact & Community** track.

## Why it matters

People in stressful situations often do not know the legal name of their problem, which institution is responsible, or what to prepare before asking for help. CaseBridge UA starts with the person's own words and bridges the gap between a lived problem and the existing public legal-aid system.

## Start without a questionnaire

- **Find support:** a bilingual, searchable directory across rights and housing, social support, education, work, and wellbeing. Filter by area, IDP audience, or resources already added to your plan.
- **My plan:** save resources, add a first action or a custom task, assign your own target date, check progress, undo task removal, and download a plain-text copy. A three-step fictional demo can be added without replacing existing work.
- **Legal route:** the existing four-step preparation tool remains available; its bilingual steps can be added to the personal plan.

The home screen includes an interactive support-area diagram, visibly layered day/night particles and light ribbons, a restrained night meteor, pointer-responsive cards, and progress transitions. Motion can be paused, respects the system reduced-motion setting, and stops when the scene is offscreen or the tab is hidden. Focus mode removes the decorative scene. These controls apply during this tab session; no preference is silently persisted.

The plan is **in-memory only** and disappears on reload. The interface states this clearly and offers a local text download. Target dates do not schedule notifications and are not legal deadlines. This is a support navigator, not a live booking service, clinical tool, or automated eligibility decision.

## Legal-route flow

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

The catalog includes nine reviewed referrals from Free Legal Aid, Guide Diia, UNHCR Ukraine, [Diia.Education](https://osvita.diia.gov.ua/), and [How Are You?](https://howareu.com/). The latter adds directories of online and community wellbeing support; the app does not provide treatment advice. Diia.Education links to learning series, career preparation, and digital hubs. These are referrals and information pages, not eligibility decisions or verified nearby appointments. Region selection in the legal tool explains the office-directory next step; no geographical distance is invented.

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
