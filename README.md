# Centre Bien-Etre 2.0

Grundgeruest fuer eine statisch deploybare Next.js-Landing-Page mit lokal gepflegten Inhalten.

## Stack

- Next.js mit App Router
- React und TypeScript
- Tailwind CSS
- shadcn-ui kompatible Komponentenbasis
- Inhalte in Markdown und YAML
- JSON Schema Validierung fuer YAML-Inhalte

## Lokale Entwicklung

```bash
npm install
npm run dev
```

## Projektstruktur

- `app/`: Routen und globale Styles
- `components/`: Layout-, UI- und Section-Komponenten
- `content/`: Sprachspezifische und geteilte Inhalte
- `schemas/`: JSON-Schemas fuer YAML-Validierung
- `.devcontainer/`: Container-Setup fuer lokale Entwicklung
- `.github/workflows/`: CI fuer Lint, Typecheck und Build

## Inhalte pflegen

- Freitext pro Sprache in `content/de/about.md` und `content/fr/about.md`
- Strukturierte Inhalte pro Sprache in `content/<locale>/page.yaml`
- Gemeinsame Standortdaten in `content/shared/practice.yaml`

## SEO und Tracking

- Es werden `robots.txt` und `sitemap.xml` automatisch ueber App-Router Metadata-Routes erzeugt.
- Globale SEO-Metadaten (Open Graph, Canonical, Robots) werden in `app/layout.tsx` gepflegt.
- Fuer absolute URLs kann optional die Site-URL gesetzt werden:

```bash
NEXT_PUBLIC_SITE_URL=https://www.example.com
```

- Optionales Open-Source-Tracking mit GoatCounter kann fuer einfache Webstatistiken eingebunden werden.
- GoatCounter ist leichtgewichtig, datensparsam und als europaeischer Dienst nutzbar.

```bash
NEXT_PUBLIC_GOATCOUNTER_ENDPOINT=https://<your-code>.goatcounter.com/count
```

Optional kann auch eine eigene Script-URL gesetzt werden, falls GoatCounter selbst gehostet wird:

```bash
NEXT_PUBLIC_GOATCOUNTER_SCRIPT_URL=https://stats.example.com/count.js
```

Wenn die GoatCounter-Variablen fehlen, wird kein Tracking-Script geladen.