# UX-Test-Platform

## Projektübersicht

Dieses Projekt ist Teil der Bachelorarbeit zum Thema:
**„Der Einfluss von Augmented Reality auf die User Experience im Vergleich zu statischen Produktbildern im E-Commerce“**.

Ziel ist es, den Einfluss von AR-Technologien auf die Nutzererfahrung beim Online-Shopping zu untersuchen. Die Plattform diente zur Durchführung eines Usability-Tests, bei dem Teilnehmende Produkte entweder in AR oder als statische Bilder betrachten konnten. Die erhobenen Daten wurden mit dem AttrakDiff-Fragebogen gesammelt und ausgewertet.

---

## Features & Aufbau der Plattform

- **AR-Produktansicht:** Interaktive Darstellung von Produkten mittels Augmented Reality (WebXR-kompatibel)
- **Statische Produktbilder:** Alternative Produktansicht als klassische Bildergalerie
- **Usability-Test:** Integrierter Fragebogen (AttrakDiff) zur Erhebung der User Experience
- **Datenerhebung:** Speicherung und Export der Testergebnisse zur weiteren Analyse

---

## Datenerhebung & Analyse

- Die Datenerhebung erfolgte mit dem standardisierten **AttrakDiff-Fragebogen**.
- Alle Dateien zur Auswertung und Analyse befinden sich im Verzeichnis `ar-ux-analyse/`.
  - Rohdaten: `ar-ux-analyse/UX-Daten/UX-Daten.xlsx`
  - Auswertungsskripte: `ar-ux-analyse/Auswertung.ipynb`, `ar-ux-analyse/Visualisierung.ipynb`
  - Grafiken: `ar-ux-analyse/Grafik/`
  - Tabellen: `ar-ux-analyse/Auswertung/`
  
---

## Installation & Nutzung

1. **Voraussetzungen:**
   - Ein moderner Webbrowser (Chrome, Firefox, Safari, Edge)
   - Optional: Python (für die Auswertung der Daten)

2. **Plattform starten:**
   - Öffne die Datei `index.html` im Browser für die Hauptplattform.
   - Für die AR-Ansicht: Stelle sicher, dass dein Gerät WebXR unterstützt.
   - Für die statische Produktansicht: Öffne `static-product.html`.
   - Der Fragebogen ist über `umfrage.html` erreichbar.
   
> **Hinweis:** Für das beste Ergebnis wird empfohlen, die Plattform über einen lokalen Webserver mit SSL-Zertifikat (https) oder einen herkömmlichen Webserver zu betreiben. Viele AR-Funktionen (WebXR) funktionieren nur über eine gesicherte Verbindung (https).


3. **Datenanalyse:**
   - Navigiere in das Verzeichnis `ar-ux-analyse/`.
   - Öffne die Jupyter Notebooks (`.ipynb`) zur Auswertung und Visualisierung der Daten.

---

## Verzeichnisstruktur (Auszug)

```
UX-Test-Platform/
├── index.html                # Hauptplattform (AR & statische Ansicht)
├── static-product.html       # Nur statische Produktbilder
├── umfrage.html              # Fragebogen (AttrakDiff)
├── js/                       # JavaScript-Dateien (Funktionalität)
├── style/                    # CSS-Dateien (Design)
├── models/                   # 3D-Modelle für AR
├── img/                      # Produktbilder
├── ar-ux-analyse/            # Datenauswertung & Analyse
│   ├── UX-Daten/             # Rohdaten (Excel)
│   ├── Grafik/               # Ergebnisgrafiken
│   ├── Auswertung/           # Analysierte UX-Daten (Tabellen)
│   └── *.ipynb               # Auswertungs-Notebooks
└── README.md                 # Diese Dokumentation
```

---

## Versionierung

Diese Version entspricht dem Stand zur Abgabe der Bachelorthesis am **8. August 2025**  
👉 GitHub Tag: **`v1.0`**

---

## Live-Demo

Die Plattform ist weiterhin unter folgender Adresse erreichbar:  
🔗 [https://ux.dynamicvisualscollective.ch](https://ux.dynamicvisualscollective.ch)  
*(Stand: Juli 2025)*

---

## Lizenz

Dieses Projekt wurde im Rahmen einer Bachelorarbeit erstellt und ist ausschliesslich für wissenschaftliche Zwecke bestimmt. Für eine anderweitige Nutzung bitte Kontakt aufnehmen.

---

## Kontakt

Bei Fragen oder Interesse an den Ergebnissen:
- **Autor:** Jasper Bleeker
- **E-Mail:** jasper.bleeker@stud.fhgr.ch
- **Universität:** Fachhochschule Graubünden
