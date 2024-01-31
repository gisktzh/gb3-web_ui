import {FaqCollection} from '../interfaces/faq.interface';

export const faqData: FaqCollection[] = [
  {
    category: 'Allgemein',
    items: [
      {
        uuid: '9b3c428f-19ae-4d07-84fe-afa42b14a781',
        question: 'Was ist das Geoportal?',
        answer:
          'Das Geoportal des Kantons Zürich ist eine Webapplikation für die Suche und Darstellung' +
          ' von kantonalen Geodaten. Die zwei wesentlichen Bestandteile des Geoportals sind der' +
          ' GIS - Browser und der Geodatenkatalog. Der GIS - Browser stellt Daten im Kartenformat' +
          ' grafisch dar. Im Geodatenkatalog sind die Geodatensätze zu finden mit den wichtigsten' +
          ' Metadaten aus dem Geolion https://geolion.zh.ch/ (Hintergrundinformationen wie z.B. ' +
          ' Herkunft, Aktualität, Hinweise zur Nutzung und zum Datenbezug).',
      },
      {
        uuid: 'a77846fb-8e4b-4411-92f5-ca919d03e7b5',
        question: 'Kann ich von einem mobilen Gerät auf das Geoportal zugreifen?',
        answer:
          'Ja, das Geoportal wurde sowohl für Desktop als auch für Tablets und Smartphones konzipiert.' +
          ' Die mobile Version ist für kleine Bildschirme optimiert, daher wurden in dieser Version' +
          ' bestimmten Funktionen weggelassen. Dazu gehören das Zeichnen und Messen, der Datenbezug und Datenimport sowie das Drucken.',
      },
      {
        uuid: 'e0c3c6d4-9fdb-4c9f-bd2b-4bfa8cffef9f',
        question: 'Warum werde ich bei einigen Karten auf maps.zh.ch weitergeleitet?',
        answer:
          'Grundsätzlich sind alle Karten im neuen Geoportal auffindbar. Einige Karten bleiben vorerst' +
          ' auf der alten Webapplikation https://maps.zh.ch . Wenn Sie eine noch nicht migrierte Karte' +
          ' anzeigen möchten, werden Sie automatisch zur alten Darstellung auf die alte Webapplikation weitergeleitet.',
      },
      {
        uuid: '4dda5dc1-eff7-4a0a-9dac-11ae13f9a122',
        question: 'Kann ich Daten aus dem GIS-Browser exportieren?',
        answer:
          'Je nach gesetzlicher Grundlage und Verfügbarkeit können Sie die Daten direkt über den GIS-Browser herunterladen' +
          ' oder im Geodatenshop https://geodatenshop.zh.ch bestellen. Verwenden Sie dafür die Desktop-Version, klicken Sie' +
          ' auf die Schaltfläche «Daten beziehen» und wählen Sie das Gebiet aus.',
      },
      {
        uuid: '864f67c7-a5c1-45e4-b4c6-baad87bb619d',
        question: 'Wie kann ich eigene Karten in den GIS-Browser importieren?',
        answer:
          'Sie können Kartendienste oder Dateien in verschiedenen Formaten über die Schaltfläche «Kartendienst importieren» einbinden.' +
          ' Die importierten Karten und Daten werden zu keinem Zeitpunkt im GIS- Browser gespeichert und können auch nicht geteilt werden.',
      },
      {
        uuid: 'da755d95-192d-4e19-b526-a5c1b9af87b5',
        question: 'Kann ich Daten im GIS-Browser bearbeiten?',
        answer: 'Nein, die Bearbeitung von Daten ist im GIS-Browser nicht möglich.',
      },
      {
        uuid: '23b2da02-25b5-4303-8ba2-cb65e11f1477',
        question: 'Wie kann ich ein Konto erstellen?',
        answer:
          'Sie können sich über die Schaltfläche «Login» oder über unser Registrierportal https://maps.zh.ch/gb3/v0/profile/sign_up ' +
          ' registrieren. Ein Login benötigen Sie, um die Funktion «Favoriten erstellen» nutzen zu können.',
      },
      {
        uuid: 'c15778a5-0940-41ab-a533-8014c2171dcd',
        question: 'Wie erhalte ich weitere Informationen zu Daten oder Karten?',
        answer: 'Weitere Informationen zu den Karten und den verwendeten Geodatensätzen finden Sie im Geodatenkatalog.',
      },
      {
        uuid: 'a5d06063-5d5c-4dc9-b3c9-8ae6ab8f2bbb',
        question: 'Welcher Bezugsrahmen gilt für die Koordinaten im Kanton Zürich?',
        answer:
          'Im Kanton Zürich gilt für die Lage aller Koordinaten der Bezugsrahmen der neuen Landesvermessung LV95 (Bezugssystem CH1903+).' +
          ' Für die Höhe gilt der Bezugsrahmen LN02 (Schweizerisches Landesnivellementsnetz basierend auf dem Ausgangspunkt «Repère Pierre' +
          ' du Niton» in Genf mit einer Höhe von 373.6 m).',
      },
      {
        uuid: 'fecc75b9-5735-4730-8bce-8d12243072e7',
        question: 'Wie kann ich den Guide, der durch die wichtigsten Funktionen des GIS-Browsers führt, erneut öffnen?',
        answer: 'Sie können im GIS-Browser bei den aktiven Karten das Fragezeichen-Symbol klicken, damit sich der Guide erneut öffnet.',
      },
    ],
  },
  {
    category: 'Kartendarstellung',
    items: [
      {
        uuid: '196fce1d-0baa-4cc0-a4a5-0e5308f85331',
        question: 'Wie kann ich Karten oder Layer im GIS-Browser anzeigen/hinzufügen?',
        answer:
          'Sie können Karten oder Layer im GIS-Browser laden, indem Sie im Kartenkatalog auf das «+» klicken. Sobald Sie eine' +
          ' Karte oder einen Layer hinzugefügt haben, wird die Karte oder der Layer unter "aktive Karten" aufgelistet und im' +
          ' Viewer grafisch dargestellt.',
      },
      {
        uuid: '2569bde8-a4c3-4975-bcdf-5327fa76475a',
        question: 'Wie kann ich eine Karte oder einen Layer ausblenden?',
        answer:
          'Deaktivieren Sie das Kontrollkästchen neben dem Karten- oder Layer-Namen. Dieses finden Sie bei «aktive Karten» unter «Ebenen».',
      },
      {
        uuid: '0496610c-b721-47e1-8a06-6a0833d08c1d',
        question: 'Kann ich eine Karte oder einen Layer umbenennen?',
        answer: 'Nein, das ist nicht möglich.',
      },
      {
        uuid: '373092e8-3fab-4419-9316-a1aacb250ee9',
        question: 'Wie kann ich die Hintergrundkarte ändern?',
        answer:
          'Sie können die Hintergrundkarte ändern, indem Sie auf die Schaltfläche «Hintergrundkarte» klicken und dann die gewünschte Karte auswählen.',
      },
      {
        uuid: '32e50e9a-0da9-4cf0-b1ec-35e3fd8dd641',
        question: 'Wie kann ich die Zoomstufe ändern?',
        answer:
          'Auf Desktop können Sie die Zoomstufe ändern, indem Sie mit der Maus oder dem Trackpad scrollen ändern oder die Schaltflächen' +
          ' «Vergrössern» und «Verkleinern» unten links auf der Karte verwenden. Auf dem mobilen Gerät können Sie das Kartenbild mit' +
          ' Fingerbewegungen anpassen, indem Sie zwei Finger auseinander - oder zusammenziehen.',
      },
      {
        uuid: '07f6ca4e-9f9f-4e93-922d-ca6912b996dd',
        question: 'Wie kann ich die Legende anzeigen?',
        answer: 'Klicken Sie auf die Schaltfläche «Legende», um diese anzuzeigen.',
      },
      {
        uuid: '95b543f6-9535-4d24-9b87-7757156ef7d9',
        question: 'Wie kann ich die Transparenz resp. das Deckvermögen einer Karte ändern?',
        answer:
          'Klicken Sie unter «aktive Karten» auf die Karte und wählen Sie «Einstellungen» aus. Dort können Sie den Schieberegler unter «Deckvermögen» verwenden.',
      },
      {
        uuid: '461ab494-7841-4b38-a395-1675ee16c8b7',
        question: 'Wie kann ich eine Kartenansicht teilen?',
        answer:
          'Klicken Sie auf die Schaltfläche «Teilen». Mit dem generierten Link können Sie die aktuelle Kartenansicht sowie Zeichnungen' +
          ' und Messungen teilen. Importierte Daten können Sie hingegen nicht teilen.',
      },
      {
        uuid: '179f9712-ea74-4fa7-b6b3-934787a48eca',
        question: 'Wie kann ich eine Kartenansicht speichern?',
        answer:
          'Sie brauchen dazu ein Konto. Wenn Sie eingeloggt sind, können Sie auf den Stern «Favorit erstellen» klicken und dann einen Namen' +
          ' für den Favoriten eingeben, um ihre Kartenansicht zu speichern.',
      },
      {
        uuid: '6947bf25-e6dd-41c1-bf44-abecd870db86',
        question: 'Warum sehe ich keine Inhalte in der Karte?',
        answer:
          'Daten sind teilweise nicht für das ganze Kantonsgebiet verfügbar oder nur in einem bestimmten Massstabsbereich sichtbar.' +
          ' Überprüfen Sie, ob die Karte und die dazugehörigen Layer eingeschaltet sind und ob Sie sich im richtigen Massstabsbereich' +
          ' befinden. Um den Sichtbarkeitsbereich eines Layers herauszufinden, gehen Sie zu den «Ebenen» unter «aktive Karten» und halten' +
          ' Sie die Maus auf dem gewünschten Layer.' +
          '<br/>' +
          'Sollten Sie immer noch nichts sehen, überprüfen Sie die Reihenfolge der dargestellten Karten unter «aktive Karten». Allenfalls' +
          ' wird ihre Karte durch eine andere Karte überlagert. Falls Sie immer noch nichts sehen, überprüfen Sie, ob andere Gebiete Daten' +
          ' enthalten. Möglicherweise sind für den Kartenausschnitt, den Sie ausgewählt haben, keine Daten verfügbar.',
      },
    ],
  },
  {
    category: 'Datenbestellung',
    items: [
      {
        uuid: 'd1c66f19-e571-4861-b3ea-449949c77a66',
        question: 'Weshalb ist ein bestimmter Datensatz nicht Open Data?',
        answer:
          'Open Government Data (OGD) umfassen sämtliche Geodaten gemäss den Anhängen 1 bis 3 der kantonalen Geoinformationsverordnung' +
          ' (KGeoIV) mit Zugangsberechtigungsstufe A, bei welchen zudem «Freie Nutzung und Weitergabe» und «Downloaddienst» mit JA' +
          ' deklariert sind. Aktuell erfüllen rund 200 Geobasisdatensätze des Kantons diese Kriterien. Die entsprechenden Dokumente' +
          ' finden Sie in der Sektion «Weiterführende Informationen».',
      },
      {
        uuid: '68da814a-b549-4700-bd32-f8fc9fe92809',
        question: 'Warum ist der Download-Knopf grau und kann nicht angeklickt werden?',
        answer:
          'Der Download-Knopf wird erst aktiviert, wenn Sie alle benötigten Parameter ausgefüllt haben. Nachdem Sie ein Gebiet ausgewählt' +
          ' haben, müssen Sie die Produkte und deren Formate auswählen.',
      },
      {
        uuid: 'd0d39ab3-f9fd-4f67-ae06-e21260df470c',
        question: 'Warum können einige Produkte bei der Bestellung nicht ausgewählt werden?',
        answer:
          'Im GIS-Browser können Sie nur offene bzw. frei verfügbare Daten (OGD) herunterladen. Produkte, die keine Checkbox haben,' +
          ' gelten nicht als OGD und müssen über den Geodatenshop https://geodatenshop.zh.ch bestellt werden.',
      },
      {
        uuid: 'c8d7779b-4dd0-425f-a1be-7e2fc4bf6aa2',
        question: 'Kann ich eine Bestellung stornieren?',
        answer: 'Wenn sie Ihre Bestellung bereits abgeschickt haben, können Sie diese nicht mehr stornieren.',
      },
      {
        uuid: '03f0912f-8fd8-47e5-8c7c-0fbe49a744e1',
        question: 'Wie kann ich die Auswahl des Gebietes verändern?',
        answer: 'Schliessen Sie das aktuelle Bestellmenü, starten Sie eine neue Bestellung und wählen Sie ein neues Gebiet aus.',
      },
      {
        uuid: 'e4a2e083-644a-490e-8ad1-bb14194db135',
        question: 'Für welchen Perimeter werden bei einer Gemeindeauswahl Daten geliefert?',
        answer: 'Die Daten werden kachelweise ausgeliefert. Jede angeschnittene Kachel wird ganz ausgeliefert.',
      },
      {
        uuid: 'fab8cdb4-dff2-46fb-a5e7-81e22cb88c1b',
        question: 'Warum ist das E-Mail mit dem Download-Link nicht angekommen?',
        answer:
          'Die Datenaufbereitung kann je nach Produkt und Grösse des Perimeters viel Zeit beanspruchen. Wir bitten Sie deshalb um etwas' +
          ' Geduld, bis Sie das E- Mail mit dem Download - Link erhalten.',
      },
      {
        uuid: 'cb0c8984-9fbb-4449-be21-33cbdebdc67e',
        question: 'Können die offenen Geodaten auch als Geodienste bezogen werden?',
        answer:
          'Ja, das ist möglich, und Sie erhalten so stets die aktuellsten Daten, die verfügbar sind. Alle Open-Data-Geodienste finden' +
          ' Sie im Geodatenkatalog https://geo.zh.ch/data . Filtern Sie dazu in der Suche nach der Kategorie "Geoservice".',
      },
      {
        uuid: '4171b365-8ccc-4d83-b03a-1bc83f911e17',
        question: 'Wie kann ich Katasterpläne bestellen?',
        answer:
          'Bitte wenden Sie sich an die Nachführungsstellen der amtlichen Vermessung. Katasterpläne können nicht über den GIS-Browser' +
          ' oder den Geodatenshop bestellt werden.',
      },
      {
        uuid: 'ac7971d8-88da-4ff6-9e02-60f334ba615b',
        question: 'Gibt es noch andere Varianten zum Bezug von offenen Geodaten?',
        answer:
          'Rasterdaten wie etwa Höhenmodelle (DTM, DOM), Orthofotos und historische Karten können Sie auch über unseren Download-Index' +
          ' https://maps.zh.ch/download/ herunterladen.',
      },
      {
        uuid: '4dba9182-e146-404c-8887-5cdd8332bc35',
        question:
          'Was bedeutet die Fehlermeldung «400 Bad Request: Raster products can only be ordered using a PARCEL selection perimeter»?',
        answer:
          'Das ausgewählte Gebiet ist zu gross. Verwenden Sie einen kleineren Ausschnitt, wenn Sie Rasterdaten bestellen, oder beziehen' +
          ' Sie die Daten aus unserem Download- Index https://maps.zh.ch/download/ .',
      },
      {
        uuid: '99ab4c2c-ce7f-48ed-a339-d580be7e0e3e',
        question: 'Was bedeutet die Fehlermeldung: «400 Bad Request: Self-intersecting polygon»?',
        answer:
          'Das von Ihnen aufgezogene Gebiet, bzw. Polygon schneidet/überlappt sich selber. Löschen Sie das Polygon und definieren Sie ein neues.',
      },
      {
        uuid: '0dd8c279-2c08-4f4e-b093-f3ebb86ff3ac',
        question: 'Wie können Kartenausschnitte aus dem GIS-Browser als Bild gespeichert werden?',
        answer: 'Verwenden Sie die Schaltfläche "Drucken" und wählen Sie das gewünschte Format aus.',
      },
      {
        uuid: '213150bb-aca7-423e-9ca1-cefb05d89ea3',
        question:
          'Ich würde gerne Orthofotos des Kantons Zürich für grosse Gebiete bis zur gesamten Kantonsfläche beziehen.' +
          ' Gibt es eine einfache Möglichkeit ein Gebiet grösser als 4 km² zu beziehen?',
        answer:
          'Sie können die Daten über unseren Download-Index https://maps.zh.ch/download/ herunterladen. Alternativ' +
          ' können Sie in der alten Webapplikation https://maps.zh.ch/ in der Karte «Digitale Höhenmodelle 2021/22 ZH»' +
          ' oder «Orthofoto ZH 2014-2021» die Kacheln direkt herunterladen. Klicken Sie dafür im Kartenfenster auf den Bereich' +
          ' der Kachel, die Sie beziehen möchten.Im rechten Info- Bereich sehen Sie nun den Link zum Download.',
      },
      {
        uuid: '72da6f34-6399-4c6d-8156-85f8140b1cef',
        question: 'Ich will kantonale Daten veröffentlichen. Welche Quelle soll ich angeben?',
        answer:
          'Details zur Quellenangabe von Daten aus dem GIS-Browser finden Sie in unseren Nutzungshinweisen https://geo.zh.ch/terms-of-use .',
      },
    ],
  },
];
