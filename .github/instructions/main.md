# Centre Bien-Être 2.0

Centre Bien-Être 2.0 ist die zweite Generation einer Landing Page für eine Physiotherapiepraxis.
Die Inhaberin der Praxis ist Christa Wolfgramm. Die Webseite ist unter der Domain centrebienetre.ch erreichbar.
Auf der Seite werden Informationen über das Physio-Team, die Angebotenen Dienstleistungen und Preise, News, Öffnungszeiten sowie den Standort angezeigt.

## Erneuerung der Webseite

Die heutige Webseite (Version 1.0) ist unter [Centre Bien-Être](https://www.centrebienetre.ch) zu finden und soll ersetzt werden.

## Features

- **Landing Page:** Eine Übersicht zum Angebot und der Praxis
- **Team:** Vorstellung der Mitarbeiterinnen
- **Services:** Details zu den Angeboten wie klassische Physiotherapie, Beratung, Coaching etc. und den Preisen
- **Kontakt:** Standort der Praxis mit Karte und Öffnungszeiten

## Architektur

- Moderne Webapplikation die als statische Webseite deployed werden kann
- Die Daten sollen lokal (Git Repository) in Markdown- und YAML-Files verwaltet werden können
- Die Webseite soll mehrsprachig sein und in Deutsch und Französisch zur Verfügung stehen (weitere Sprachen solllen später ergänzt werden können)

## Tooling

- Web-Framework: React und Next.js
- Tailwind CSS und shadcn-ui
- DevContainer für die lokale Entwicklungsumgebung
- Deployment via GitOps, GitHub Actions$
- JSONSchema um die Daten aus den YAML Files validieren zu können

