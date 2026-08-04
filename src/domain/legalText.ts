/**
 * Verbatim excerpts of the Verwaltungsvorschrift zur StVO (VwV-StVO),
 * Abschnitte XI (Grünpfeil, Zeichen 720) und XII (Grünpfeil für den Radverkehr,
 * Zeichen 721). Used as the fixed text in the report. Keyed by legal reference
 * so each checklist step can quote exactly its basis.
 */

/** Official full text on Verwaltungsvorschriften im Internet (sister portal of Gesetze im Internet). */
export const VWV_STVO_URL =
  'https://www.verwaltungsvorschriften-im-internet.de/bsvwvbund_26012001_S3236420014.htm'

export const LEGAL_TEXT: Record<string, string> = {
  'XI.1 S.1':
    'Der Einsatz des Schildes mit grünem Pfeil auf schwarzem Grund (Grünpfeil) kommt nur in Betracht, wenn der Rechtsabbieger Fußgänger- und Fahrzeugverkehr der freigegebenen Verkehrsrichtungen ausreichend einsehen kann, um die ihm auferlegten Sorgfaltspflichten zu erfüllen.',
  'XI.1 a':
    'Es darf nicht verwendet werden, wenn dem entgegenkommenden Verkehr ein konfliktfreies Abbiegen nach links signalisiert wird.',
  'XI.1 b':
    'Es darf nicht verwendet werden, wenn für den entgegenkommenden Linksabbieger der grüne Pfeil gemäß § 37 Abs. 2 Nr. 1 Satz 4 verwendet wird.',
  'XI.1 c':
    'Es darf nicht verwendet werden, wenn Pfeile in den für den Rechtsabbieger gültigen Lichtzeichen die Fahrtrichtung vorschreiben.',
  'XI.1 d':
    'Es darf nicht verwendet werden, wenn beim Rechtsabbiegen Gleise von Schienenfahrzeugen gekreuzt oder befahren werden müssen.',
  'XI.1 e':
    'Es darf nicht verwendet werden, wenn der freigegebene Fahrradverkehr auf dem zu kreuzenden Radweg für beide Richtungen zugelassen ist oder der Fahrradverkehr trotz Verbotes in der Gegenrichtung in erheblichem Umfang stattfindet und durch geeignete Maßnahmen nicht ausreichend eingeschränkt werden kann. (Für Zeichen 721 nicht anzuwenden.)',
  'XI.1 f':
    'Es darf nicht verwendet werden, wenn für das Rechtsabbiegen mehrere markierte Fahrstreifen zur Verfügung stehen.',
  'XI.1 g':
    'Es darf nicht verwendet werden, wenn die Lichtzeichenanlage überwiegend der Schulwegsicherung dient.',
  'XI.1 h':
    'Es darf nicht verwendet werden, wenn sich im unmittelbaren Bereich des rechtsabbiegenden Fahrverkehrs eine Aufstellfläche für das Linksabbiegen mit indirekter Radverkehrsführung befindet.',
  'XI.2':
    'An Kreuzungen und Einmündungen, die häufig von seh- oder gehbehinderten Personen überquert werden, soll die Grünpfeil-Regelung nicht angewandt werden. Ist sie ausnahmsweise an Kreuzungen oder Einmündungen erforderlich, die häufig von Blinden oder Sehbehinderten überquert werden, so sind Lichtzeichenanlagen dort mit akustischen oder anderen geeigneten Zusatzeinrichtungen auszustatten.',
  'XI.3':
    'Für Knotenpunktzufahrten mit Grünpfeil ist das Unfallgeschehen regelmäßig mindestens anhand von Unfallsteckkarten auszuwerten. Im Falle einer Häufung von Unfällen, bei denen der Grünpfeil ein unfallbegünstigender Faktor war, ist der Grünpfeil zu entfernen, soweit nicht verkehrstechnische Verbesserungen möglich sind. Eine Unfallhäufung liegt in der Regel vor, wenn in einem Zeitraum von drei Jahren zwei oder mehr Unfälle mit Personenschaden, drei Unfälle mit schwerwiegendem oder fünf Unfälle mit geringfügigem Verkehrsverstoß geschehen sind.',
  'XI.4':
    'Der auf schwarzem Grund ausgeführte grüne Pfeil darf nicht leuchten, nicht beleuchtet sein und nicht retroreflektieren. (Satz 2 zur Schildgröße 250 × 250 mm gilt für Zeichen 721 nicht.)',
  'XII.1':
    'Für die Anordnung des Grünpfeils für den Radverkehr (Zeichen 721) gelten die Vorgaben der Nummer XI mit Ausnahme der Nummer 1 Buchstabe e und der Nummer 4 Satz 2 entsprechend.',
  'XII.2 a':
    'Über die in Nummer XI Nummer 1 Satz 2 genannten Fälle hinaus kommt eine Anordnung des Grünpfeils für den Radverkehr nicht in Betracht, wenn bei allgemein hohem Radverkehrsaufkommen der Anteil des geradeaus fahrenden Radverkehrs den Anteil des nach rechts abbiegenden Radverkehrs erheblich übersteigt und die Verkehrsfläche ein sicheres Überholen des wartenden Radverkehrs nicht gewährleistet.',
  'XII.2 b':
    'Eine Anordnung kommt nicht in Betracht, wenn der nach rechts abbiegende Radverkehr in der Knotenpunktzufahrt auf einem gemeinsamen Geh- und Radweg (Zeichen 240) oder einem für den Radverkehr freigegebenen Gehweg geführt wird (Zeichen 239 in Verbindung mit Zusatzzeichen 1022-10).',
  'XII.2 S':
    'Befindet sich in der Straße, in die eingebogen wird, ein baulich angelegter Radweg, muss dieser deutlich von dem daneben befindlichen Gehweg abgegrenzt sein. Warteflächen für zu Fuß Gehende müssen über eine hinreichende Größe verfügen. Entsprechendes gilt bei Vorliegen eines getrennten Rad- und Gehweges (Zeichen 241).',
  'XII.3':
    'Zeichen 721 ist grundsätzlich am Hauptsignalgeber anzubringen. Sind besondere Lichtzeichen für den Radverkehr vorhanden, soll Zeichen 721 am Signalgeber für den Radverkehr angebracht werden, wenn hierdurch der Fußverkehr nicht gefährdet wird.',
  'XII.4':
    'Eine gemeinsame Anordnung von Zeichen 720 und Zeichen 721 ist unzulässig, wenn der Radverkehr auf einem am rechten Fahrbahnrand befindlichen Radfahrstreifen, einem Schutzstreifen für den Radverkehr oder einem straßenbegleitenden, nicht abgesetzten, baulich angelegten Radweg geführt wird und der Radverkehr die Lichtzeichen für den Fahrverkehr zu beachten hat.',
}

export function legalText(ref?: string): string | undefined {
  return ref ? LEGAL_TEXT[ref] : undefined
}
