import {OnboardingGuideConfig} from '../interfaces/onboarding-guide-config.interface';

export const mapOnboardingGuideConfig: OnboardingGuideConfig = {
  id: 'map.tour',
  introductionImage: '/assets/images/onboarding-guide/intro.png',
  steps: [
    {
      anchorId: 'map.start.tour',
      content:
        'Lernen Sie die wichtigsten Funktionen kennen.<br><small>Navigieren Sie mit der Maus oder den Pfeiltasten durch den Guide und beenden Sie ' +
        'ihn wahlweise mit ESC oder durch den entsprechenden Button.</small>',
      title: 'Willkommen auf dem GIS-Browser des Kanton Zürich',
      enableBackdrop: true
    },
    {
      anchorId: 'map.catalogue',
      content: 'Wählen Sie eine oder mehrere Karten aus.',
      title: 'Kartenkatalog',
      enableBackdrop: true
    },
    {
      anchorId: 'map.active.map.items',
      content: 'Passen Sie Reihenfolge, Transparenz und Einstellung der dargestellten Karten an.',
      title: 'Dargestellte Karten',
      enableBackdrop: true
    },
    {
      anchorId: 'map.basemap.selector',
      content: 'Wechseln Sie die Hintergrundkarte.',
      title: 'Hintergrund',
      enableBackdrop: true
    },
    {
      anchorId: 'map.feature.info',
      content: 'Klicken Sie auf Kartenobjekte und erhalten Sie Informationen dazu.',
      title: 'Info-Klick',
      enableBackdrop: false
    },
    {
      anchorId: 'map.end.tour',
      content: 'Wir wünschen viel Vergnügen bei der Nutzung des GIS-Browsers!',
      title: 'Das wars!',
      enableBackdrop: false
    }
  ]
};
