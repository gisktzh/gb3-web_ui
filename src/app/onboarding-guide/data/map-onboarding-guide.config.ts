import {OnboardingGuideConfig} from '../interfaces/onboarding-guide-config.interface';

export const mapOnboardingGuideConfig: OnboardingGuideConfig = {
  id: 'map.tour',
  steps: [
    {
      anchorId: 'map.tour.start',
      content:
        'Lernen Sie die wichtigsten Funktionen kennen.<br>' +
        'Navigieren Sie mit der Maus oder den Pfeiltasten durch den Guide und ' +
        'beenden Sie ihn wahlweise mit ESC oder durch den entsprechenden Button.',
      title: 'Willkommen auf dem GIS-Browser des Kantons Zürich',
      enableBackdrop: true,
      showArrow: false,
      image: '/assets/images/onboarding-guide/intro.png',
    },
    {
      anchorId: 'map.search.input',
      content:
        'Im Suchfeld können Sie nach Orten, Adressen und Kartenthemen suchen. Ausgewählte Karten werden zu „Aktive Karten" ' +
        'hinzugefügt.',
      title: 'Suche',
      enableBackdrop: true,
    },
    {
      anchorId: 'map.search.filter',
      content: 'Mit dem Suchfilter können sie Suchergebnisse eingrenzen, z.B. nach Orten, Adressen oder Karten.',
      title: 'Suchfilter',
      enableBackdrop: true,
      placement: {
        yPosition: 'above',
        xPosition: 'after',
      },
    },
    {
      anchorId: 'map.active-maps',
      content:
        'Hier erscheinen alle dargestellten Karten. Sie können Inhalte ein- und ausblenden, Reihenfolgen ändern und Einstellungen am ' +
        'Kartenbild vornehmen.',
      title: 'Aktive Karten',
      enableBackdrop: true,
    },
    {
      anchorId: 'map.tools',
      content: 'Hier finden Sie verschiedene Funktionen wie Messen, Zeichnen, Drucken, Kartenimport sowie den Datenbezug.',
      title: 'Werkzeuge',
      enableBackdrop: true,
      placement: {
        xPosition: 'before',
        horizontal: true,
      },
    },
    {
      anchorId: 'map.navigation',
      content: 'Navigieren Sie in der Karte, zoomen Sie ins Kartenbild oder ändern Sie den Kartenausschnitt.',
      title: 'Navigation',
      enableBackdrop: true,
    },
    {
      anchorId: 'map.background',
      content: 'Wechseln Sie die Hintergrundkarte.',
      title: 'Hintergrund',
      enableBackdrop: true,
    },
    {
      anchorId: 'map.info',
      content: 'Klicken Sie auf Kartenobjekte und erhalten Sie Informationen dazu.',
      title: 'Info-Klick',
      enableBackdrop: false,
      showArrow: false,
    },
    {
      anchorId: 'map.tour.end',
      content: 'Wir wünschen Ihnen viel Vergnügen bei der Nutzung des GIS-Browsers!',
      title: "Das war's",
      showArrow: false,
      image: '/assets/images/onboarding-guide/intro.png',
    },
  ],
};
