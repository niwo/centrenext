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