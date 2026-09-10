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

The prototype runs entirely in the browser and does not transmit or retain entered information.

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

## License

MIT
