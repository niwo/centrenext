# Centre Bien-Etre

[![Next.js](https://img.shields.io/badge/Built%20with-Next.js-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![GoatCounter](https://img.shields.io/badge/Analytics-GoatCounter-7c3aed)](https://centrebienetre.goatcounter.com)
[![Netlify](https://img.shields.io/badge/Hosted%20on-Netlify-00C7B7?logo=netlify&logoColor=white)](https://www.netlify.com)
[![Sveltia CMS](https://img.shields.io/badge/CMS-Sveltia-ff6b6b)](https://sveltiacms.app)

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
- `content/`: optionaler lokaler Checkout des externen Content-Repos (ignoriert)
- `public/media/`: optimierte Build-Artefakte aus dem externen Content-Repo (ignoriert)
- `schemas/`: JSON-Schemas fuer YAML-Validierung
- `.devcontainer/`: Container-Setup fuer lokale Entwicklung
- `.github/workflows/`: CI fuer Lint, Typecheck und Build

## Inhalte pflegen

- Inhaltsdateien liegen im separaten Content-Repository.
- Dieses Website-Repository enthält keine produktiven YAML-Inhalte mehr unter `content/`.
- Site-spezifische Bilder werden ebenfalls aus dem Content-Repository bezogen.

## Externes Content-Repository

Die Website kann Inhalte und bildbasierte Assets aus einem separaten privaten GitHub-Repository lesen. Das ist die saubere Variante, wenn Code und redaktionelle Daten getrennt versioniert werden sollen.

Empfohlene Struktur im privaten Content-Repository:

- `content/`
- `media/`

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

Netlify Build:

- Setze in Netlify die Variable `CONTENT_REPO_TOKEN` (PAT mit Leserechten auf `niwo/centrebienetre-content`).
- Wenn kein lokales `content/` und kein `CENTRENEXT_CONTENT_REPO_DIR` vorhanden ist, checkt `npm run content:prepare` das Content-Repo automatisch nach `.content-source` aus.
- Optional koennen `CENTRENEXT_CONTENT_REPO_SLUG` (Default: `niwo/centrebienetre-content`) und `CENTRENEXT_CONTENT_REPO_BRANCH` (Default: `main`) gesetzt werden.

Wenn `CENTRENEXT_CONTENT_REPO_DIR` gesetzt ist, wird vor `dev` und `build` ein Build-Snapshot in `.content-build/content` erzeugt. Next.js liest waehrend des Builds und im Dev-Server aus diesem Snapshot statt direkt aus dem Quell-Repository.

`npm run dev` startet zusaetzlich einen Watcher: Aenderungen in `content/` und bei externem Repository auch in `public/` loesen automatisch ein neues `content:prepare` aus. Damit werden lokale Inhalte, Uploads und optimierte Bilder ohne Dev-Neustart nachgezogen.

Fuer Medien gilt dabei:

- Die Quelldateien werden aus `.content-source/media/` gelesen.
- Rasterbilder werden fuer den Website-Build optimiert.
- JPG- und PNG-Referenzen in den Content-Dateien werden im Build-Snapshot auf WebP umgeschrieben.
- Die optimierten bzw. kopierten Mediendateien werden nach `public/media/` geschrieben, damit der statische Export sie direkt ausliefern kann.
- Das Content-Repository verwendet eine flache `media/`-Struktur ohne Unterordner.

Die Quelldaten im privaten Repository bleiben dabei unveraendert.

Hinweis zur Aufraeumung:

- Falls lokal noch ein alter `content/`-Ordner existiert, wird er von Git ignoriert.
- Die Quelle fuer Inhalte und Bilder ist das externe Content-Repository.

Optional koennen die Pfade feiner gesteuert werden:

- `CENTRENEXT_CONTENT_DIR` fuer einen direkten Override des `content/`-Verzeichnisses
- `CENTRENEXT_CONTENT_MEDIA_DIR` fuer einen direkten Override des Quell-`media/`-Verzeichnisses

## Sveltia CMS

- Das Admin-Interface ist unter `/admin/index.html` verfuegbar und wird aus `public/admin/` statisch mit ausgeliefert.
- Die CMS-Konfiguration verwaltet Inhalte in Markdown und YAML fuer Praxisdaten, Uebersetzungen, Team, Angebote, News, Testimonials und Bereichseinleitungen.
- Sveltia schreibt direkt ins Content-Repository `niwo/centrebienetre-content` (Backend `github`) statt ins Website-Repository.
- Allgemeine Basis-Uebersetzungen (Navigation, Tage, Hero, Footer, Testimonials-Kerntexte) liegen als Code-Defaults im Hauptrepository und werden beim Laden mit `content/i18n/*.yaml` gemerged.
- Werte aus `content/i18n/*.yaml` haben Vorrang und ueberschreiben die Code-Defaults, damit redaktionelle Anpassungen weiterhin ohne Code-Deploy moeglich sind.

Empfohlener Hybrid-Workflow fuer `content/i18n/*.yaml`:

- Nur Keys im Content-Repo pflegen, die bewusst vom Standard abweichen (Override-only).
- Fehlt ein Key in `content/i18n/*.yaml`, greift automatisch der Core-Default aus `lib/i18n-core.ts`.
- Bei Copy-Updates zuerst Core-Defaults anpassen, danach nur gezielte Sprach-/Branding-Abweichungen im Content-Repo belassen.
- Sveltia ist auf `simple` konfiguriert: Inhalte werden direkt auf den konfigurierten Ziel-Branch (`main`) geschrieben.
- Lokal kann der CMS-Workflow mit dem lokalen Backend getestet werden (Sveltia Local Proxy im Content-Repo starten):

```bash
npm run cms:proxy
```

Danach im Website-Repo den Dev-Server starten und `/admin` oeffnen:

```bash
cd ../centrenext
npm run dev
```

Wichtig: Wenn der Proxy stattdessen im Website-Repo gestartet wird, erscheinen Collections lokal oft leer, da die YAML-Dateien im separaten Content-Repo liegen.

- Die URL der produktiven Netlify-Site kann in `public/admin/settings.js` als `siteUrl` hinterlegt werden. Auf `localhost` wird dann automatisch zur gehosteten Admin-Seite weitergeleitet.
- Fuer die produktive Nutzung muss das Sveltia-`github` Backend per OAuth App konfiguriert werden (Client-ID/Secret und Callback-URL passend zur Admin-URL).

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
