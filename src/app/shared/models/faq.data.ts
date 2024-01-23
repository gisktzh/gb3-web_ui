import {FaqCollection} from '../interfaces/faq.interface';

export const faqData: FaqCollection[] = [
  {
    category: 'Allgemein',
    items: [
      {
        question: 'Was ist ein GIS-Viewer?',
        answer:
          'Ein GIS-Viewer ist ein Programm, das es Benutzern ermöglicht, Geodaten in Karten und anderen grafischen Formaten anzuzeigen und zu analysieren.',
      },
      {
        question: 'Wie kann ich Karten oder Layer im GIS-Browser anzeigen?',
        answer:
          "Sie können Layer in den Viewer laden, indem Sie auf die Schaltfläche 'Layer hinzufügen' klicken und dann den gewünschten Layer auswählen oder ihn hochladen.",
      },
      {
        question: 'Wie kann ich die Zoomstufe ändern?',
        answer:
          "Sie können die Zoomstufe ändern, indem Sie das Scrollrad Ihrer Maus verwenden oder die Schaltflächen 'Vergrössern' und 'Verkleinern' auf der Karte verwenden.",
      },
      {
        question: 'Kann ich Daten in den Viewer exportieren?',
        answer:
          "Ja, Sie können Daten aus dem Viewer exportieren, indem Sie auf die Schaltfläche 'Exportieren' klicken und dann das gewünschte Format auswählen.",
      },
      {
        question: 'Kann ich Daten im Viewer bearbeiten?',
        answer:
          'Die Bearbeitung von Daten ist im Viewer nicht möglich, aber Sie können geänderte Daten als neue Layer hinzufügen oder in einer separaten Software bearbeiten',
      },
    ],
  },
  {
    category: 'Layer-Verwaltung',
    items: [
      {
        question: 'Wie kann ich einen Layer ausblenden?',
        answer: 'Sie können einen Layer ausblenden, indem Sie das Kontrollkästchen neben dem Layer-Namen deaktivieren.',
      },
      {
        question: 'Kann ich einen Layer umbenennen?',
        answer: 'Nein, Layer können nicht umbenannt werden.',
      },
    ],
  },
  {
    category: 'Kartendarstellung',
    items: [
      {
        question: 'Kann ich die Hintergrundkarte ändern?',
        answer:
          "Ja, Sie können die Hintergrundkarte ändern, indem Sie auf die Schaltfläche 'Hintergrundkarte' klicken und dann die gewünschte Karte auswählen",
      },
      {
        question: 'Wie kann ich die Legende anzeigen?',
        answer: "Sie können die Legende anzeigen, indem Sie auf die Schaltfläche 'Legende' klicken.",
      },
      {
        question: 'Wie kann ich das Deckvermögen eines Layers ändern?',
        answer:
          'Sie können das Deckvermögen eines Layers ändern, indem Sie auf den Layer klicken und dann den Schieberegler unter' +
          " 'Deckvermögen' verwenden.",
      },
      {
        question: 'Kann ich die Kartenansicht speichern?',
        answer:
          "Ja, Sie können die Kartenansicht speichern, indem Sie auf den Stern 'Favorit erstellen speichern' klicken und dann einen Namen für den Favorit eingeben. Um einen Favoriten zu erstellen, müssen Sie eingeloggt sein.",
      },
    ],
  },
  {
    category: 'Benutzerkonto',
    items: [
      {
        question: 'Wie kann ich ein Login erstellen?',
        answer:
          'Sie können sich unter folgendem Link für den GIS-Browser registrieren:' +
          ' https://maps.zh.ch/session/sign_up?group=gb3-group-view \\n Ein Login benötigen Sie, um die Funktion «Favoriten erstellen»' +
          ' nutzen zu können.',
      },
    ],
  },
];
