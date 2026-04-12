# Centre Bien-Etre

[![Next.js](https://img.shields.io/badge/Built%20with-Next.js-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![GoatCounter](https://img.shields.io/badge/Analytics-GoatCounter-7c3aed)](https://centrebienetre.goatcounter.com)
[![Netlify](https://img.shields.io/badge/Hosted%20on-Netlify-00C7B7?logo=netlify&logoColor=white)](https://www.netlify.com)
[![Decap CMS](https://img.shields.io/badge/CMS-Decap-e11d48)](https://decapcms.org)

Das vorliegende Projekt implementiert die Webseite für **Centre bien-être**.

## Stack

- Next.js mit App Router
- React und TypeScript
- Tailwind CSS
- shadcn-ui kompatible Komponentenbasis
- Inhalte in Markdown und YAML
- JSON Schema Validierung fuer YAML-Inhalte
- Deployment als statische Webseite auf [Netlify](https://www.netlify.com/)

## Lokale Entwicklung

```bash
npm install
npm run dev
```

### Entwicklung mit Dev Container

Voraussetzungen:

- Docker Desktop oder Docker Engine
- VS Code mit Erweiterung **Dev Containers** (`ms-vscode-remote.remote-containers`)

Projekt im Container starten:

1. Repository in VS Code oeffnen.
2. Command Palette oeffnen und `Dev Containers: Reopen in Container` ausfuehren.
3. Beim ersten Start wird der Container gebaut und `npm install` automatisch ausgefuehrt (`postCreateCommand`).
4. Entwicklungsserver im Container starten:

```bash
npm run dev
```

Der Container nutzt das Image `mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm`.

## Projektstruktur

- `app/`: Routen und globale Styles
- `components/`: Layout-, UI- und Section-Komponenten
- `content/`: Sprachspezifische und geteilte Inhalte
- `schemas/`: JSON-Schemas fuer YAML-Validierung
- `.devcontainer/`: Container-Setup fuer lokale Entwicklung
- `.github/workflows/`: CI fuer Lint, Typecheck und Build

## Inhalte pflegen

- Bereichsinhalte mehrsprachig in `content/data/pages/*.yaml`
- Strukturierte Inhalte fuer Team, Angebote, News und Testimonials in `content/data/*/*.yaml`
- Gemeinsame Standortdaten in `content/data/main.yaml`

## Externes Content-Repository

Die Website kann Inhalte und bildbasierte Assets aus einem separaten privaten GitHub-Repository lesen. Das ist die saubere Variante, wenn Code und redaktionelle Daten getrennt versioniert werden sollen.

Empfohlene Struktur im privaten Content-Repository:

- `content/`
- `public/images/`
- `public/uploads/`

Lokale Entwicklung mit separatem Repository:

```bash
git clone git@github.com:<org>/centrebienetre-content.git .content-source
CENTRENEXT_CONTENT_REPO_DIR=.content-source npm run dev
```

Build und Validierung mit separatem Repository:

```bash
CENTRENEXT_CONTENT_REPO_DIR=.content-source npm run validate:content
CENTRENEXT_CONTENT_REPO_DIR=.content-source npm run build
```

CI/CD (GitHub Actions):

- Der Workflow checkt das private Content-Repo nach `centrebienetre-content/` aus und setzt `CENTRENEXT_CONTENT_REPO_DIR` automatisch.
- Das Repo-Secret `CONTENT_REPO_TOKEN` ist erforderlich (PAT mit Leserechten auf `niwo/centrebienetre-content`).

Wenn `CENTRENEXT_CONTENT_REPO_DIR` gesetzt ist, wird vor `dev` und `build` ein Build-Snapshot in `.content-build/content` erzeugt. Next.js liest waehrend des Builds und im Dev-Server aus diesem Snapshot statt direkt aus dem Quell-Repository.

Fuer Bilder gilt dabei:

- Die Quellbilder werden aus `.content-source/public/images/` gelesen.
- Rasterbilder werden fuer den Website-Build optimiert.
- JPG- und PNG-Referenzen in den Content-Dateien werden im Build-Snapshot auf WebP umgeschrieben.
- Die optimierten Bilder werden nach `public/images/` geschrieben, damit der statische Export sie direkt ausliefern kann.

Fuer Uploads gilt dabei:

- Decap-Uploads liegen unter `public/uploads/` (z. B. Bilder, PDFs, Dokumente).
- `public/uploads/` wird unveraendert aus dem Content-Repository in die Website uebernommen (ohne Bild-Optimierung), damit alle Dateitypen erhalten bleiben.

Die Quelldaten im privaten Repository bleiben dabei unveraendert.

Optional koennen die Pfade feiner gesteuert werden:

- `CENTRENEXT_CONTENT_DIR` fuer einen direkten Override des `content/`-Verzeichnisses
- `CENTRENEXT_CONTENT_PUBLIC_DIR` fuer einen direkten Override des Quell-`public/`-Verzeichnisses

## Decap CMS

- Das Admin-Interface ist unter `/admin/index.html` verfuegbar und wird aus `public/admin/` statisch mit ausgeliefert.
- Die CMS-Konfiguration verwaltet Inhalte in Markdown und YAML fuer Praxisdaten, Uebersetzungen, Team, Angebote, News, Testimonials und Bereichseinleitungen.
- Lokal kann der CMS-Workflow mit dem lokalen Backend getestet werden:

```bash
npx decap-server
```

- Die URL der produktiven Netlify-Site kann in `public/admin/settings.js` als `siteUrl` hinterlegt werden. Auf `localhost` wird dann automatisch zur gehosteten Admin-Seite weitergeleitet.
- Fuer die produktive Nutzung auf Netlify muessen **Netlify Identity** und **Git Gateway** aktiviert sein, da das CMS mit dem `git-gateway` Backend konfiguriert ist.
- Nach dem Aktivieren von Identity sollten Redakteurinnen und Redakteure ueber Netlify eingeladen werden, damit der Login unter `/admin/index.html` funktioniert.

Wichtige Einschraenkung bei getrenntem Repository:

- Das aktuelle Decap-Setup mit `git-gateway` schreibt immer in dieses Website-Repository.
- Wenn Inhalte in ein separates privates GitHub-Repository verschoben werden, muss Decap auf ein Backend umgestellt werden, das direkt in dieses Content-Repository schreibt, oder das CMS muss aus dem Content-Repository selbst betrieben werden.
- Die hier umgesetzte Trennung entkoppelt Build und Laufzeitdaten. Sie loest nicht automatisch die Cross-Repo-Schreibrechte des aktuellen Decap-Setups.

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
