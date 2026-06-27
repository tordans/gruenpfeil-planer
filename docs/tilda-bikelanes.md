# TILDA-Radinfrastruktur im Grünpfeil-Planer

Die Karte blendet die Radverkehrsführungen aus dem TILDA-Datensatz
**`atlas_generalized_bikelanes`** ein (FixMyBerlin / tilda-geo.de).

- Tiles: `https://tiles.tilda-geo.de/atlas_generalized_bikelanes/{z}/{x}/{y}`
  (Vector, source-layer `bikelanes`)
- Attribution: © OpenStreetMap; tilda-geo.de
- Klick auf eine Linie öffnet ein Popup mit der übersetzten Kategorie und einem
  Deeplink zur jeweiligen Geometrie auf tilda-geo.de.

## Darstellung

Alle Führungen werden **blau** gezeichnet. Die Strichelung kodiert die Relevanz
für die konkrete StVO-Prüfung des Grünpfeils für den Radverkehr (Zeichen 721):

- **durchgezogen** = für die Prüfung **relevant**
- **gestrichelt** = **nicht prüfungsrelevant** (nur zur Orientierung)

## Relevanz-Regel

> Eine Kategorie ist **relevant**, wenn sie eine Form der Radverkehrsführung
> beschreibt, die an einer **Knotenpunktzufahrt straßenbegleitend oder
> fahrbahngebunden** verläuft und damit von den Kriterien der VwV-StVO XI/XII
> unmittelbar erfasst wird (Radführungsform, die Fälle Z240 / Z241 /
> Z239 + 1022-10, die fahrbahnseitigen Streifen nach XII.4) – oder die die
> **Querung** darstellt, die die Rechtsabbiegebewegung nutzt.
>
> **Nicht relevant** sind selbstständig geführte Wege (`_isolated`, nicht Teil
> des Knotenpunkts), knotenpunktferne Kontexte (Spielstraße, Fußgängerzone,
> reiner Mischverkehr) sowie Meta-/Unklar-Platzhalter.

Begründung der einzelnen Zuordnungen:

| Kategorie | Bezeichnung | Relevant | Begründung |
| --- | --- | :---: | --- |
| `bicycleRoad` | Fahrradstraße | ✅ | Eigenständige Führungsform an der Zufahrt |
| `bicycleRoad_vehicleDestination` | Fahrradstraße mit Anlieger/Kfz frei | ✅ | wie oben |
| `crossing` | Straßenquerung | ✅ | Querung, die die Abbiegebewegung nutzt |
| `cycleway_crossing` | Straßenquerung (Radverkehr) | ✅ | Querung des Radverkehrs |
| `cycleway_adjoining` | Radweg (straßenbegleitend) | ✅ | Straßenbegleitend an der Zufahrt |
| `cycleway_adjoiningOrIsolated` | Radweg (straßenbegl. o. selbst.; unklar) | ✅ | kann straßenbegleitend sein |
| `cycleway_isolated` | Radweg, selbstständig geführt | ❌ | Nicht Teil des Knotenpunkts |
| `cyclewayLink` | Radweg-Verbindungsstück | ✅ | Bestandteil der Routenführung |
| `cyclewayOnHighway_advisory` | Schutzstreifen | ✅ | Fahrbahngebunden (u. a. XII.4) |
| `cyclewayOnHighway_advisoryOrExclusive` | Radfahrstreifen o. Schutzstreifen (unklar) | ✅ | fahrbahngebunden |
| `cyclewayOnHighway_exclusive` | Radfahrstreifen | ✅ | Fahrbahngebunden (XII.4) |
| `cyclewayOnHighwayBetweenLanes` | Radfahrstreifen in Mittellage (Fahrradweiche) | ✅ | fahrbahngebunden |
| `cyclewayOnHighwayProtected` | Geschützter Radfahrstreifen (PBL) | ✅ | fahrbahngebunden |
| `footAndCyclewaySegregated_adjoining` | Getrennter Rad-/Gehweg, straßenbegl. | ✅ | Fall Z241 (XII.2 S) |
| `footAndCyclewaySegregated_adjoiningOrIsolated` | Getrennter Rad-/Gehweg (unklar) | ✅ | kann straßenbegleitend sein |
| `footAndCyclewaySegregated_isolated` | Getrennter Rad-/Gehweg, selbstständig | ❌ | Nicht Teil des Knotenpunkts |
| `footAndCyclewayShared_adjoining` | Gem. Geh-/Radweg, straßenbegl. | ✅ | Ausschlussfall Z240 (XII.2 b) |
| `footAndCyclewayShared_adjoiningOrIsolated` | Gem. Geh-/Radweg (unklar) | ✅ | kann straßenbegleitend sein |
| `footAndCyclewayShared_isolated` | Gem. Geh-/Radweg, selbstständig | ❌ | Nicht Teil des Knotenpunkts |
| `footwayBicycleYes_adjoining` | Gehweg, Rad frei, straßenbegl. | ✅ | Ausschlussfall Z239+1022-10 (XII.2 b) |
| `footwayBicycleYes_adjoiningOrIsolated` | Gehweg, Rad frei (unklar) | ✅ | kann straßenbegleitend sein |
| `footwayBicycleYes_isolated` | Gehweg, Rad frei, selbstständig | ❌ | Nicht Teil des Knotenpunkts |
| `sharedBusLaneBikeWithBus` | Radfahrstreifen mit Bus frei | ✅ | Fahrbahngebunden |
| `sharedBusLaneBusWithBike` | Bussonderfahrstreifen, Rad frei | ✅ | Fahrbahngebunden |
| `livingStreet` | Verkehrsberuhigter Bereich (Spielstraße) | ❌ | Kein typischer signalisierter Knotenpunkt |
| `pedestrianAreaBicycleYes` | Fußgängerzone, Fahrrad frei | ❌ | Kein signalisierter Knotenpunkt |
| `sharedMotorVehicleLane` | Gemeinsamer Fahrstreifen (Mischverkehr) | ❌ | Keine eigene Radführung; ggf. Z720 statt Z721 |
| `separate_geometry` | RVA als separate Geometrie erfasst | ❌ | Meta-Eintrag, keine Führungsform |
| `needsClarification` | Führungsform unklar | ❌ | Einordnung offen |

> Hinweis: `*_adjoiningOrIsolated` wird vorsorglich als relevant behandelt, weil
> die Führung straßenbegleitend sein kann; das ist im Zweifel zu prüfen.

Die maßgebliche, maschinenlesbare Quelle dieser Zuordnung ist
[`src/domain/tildaBikelanes.ts`](../src/domain/tildaBikelanes.ts) (`relevant`-Flag
je Kategorie). Diese Tabelle muss mit dieser Datei konsistent gehalten werden.

## Deeplink-Format

Aufbau nach
[FixMyBerlin/tilda-geo · Features-Parameter-Deeplinks](https://github.com/FixMyBerlin/tilda-geo/blob/develop/docs/Features-Parameter-Deeplinks.md):

```
https://tilda-geo.de/regionen/radinfra?map=ZOOM/LAT/LON&config=CONFIG&v=2&f=FEATURES
```

`f` je Feature: `10|<osmType>/<osmId>|<minLng>|<minLat>|<maxLng>|<maxLat>`
(`10` = Quelle `atlas_bikelanes`, Koordinaten EPSG:4326, max. 6 Nachkommastellen).
