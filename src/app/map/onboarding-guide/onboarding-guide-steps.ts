import {IMdStepOption} from 'ngx-ui-tour-md-menu/lib/step-option.interface';

/**
 * All TourAnchors that are in use throughout the app. Do not use string anchors or tourAnchor directly, but add new steps and their anchors
 * to this type.
 */
export type OnboardingGuideAnchor = 'start.tour' | 'map.catalogue' | 'active.map.items' | 'basemap.selector' | 'feature.info' | 'end.tour';

/**
 * Ovveride of the default IMdStepOption to force the usage of the OnboardingGuideAnchor types, which are also used in the TypedTourAnchor
 * directive.
 */
interface OnboardingStep extends IMdStepOption {
  anchorId: OnboardingGuideAnchor;
}

export const onboardingGuideSteps: OnboardingStep[] = [
  {
    anchorId: 'start.tour',
    content: 'Lernen Sie die wichtigsten Funktionen kennen.',
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
    anchorId: 'active.map.items',
    content: 'Passen Sie Reihenfolge, Transparenz und Einstellung der dargestellten Karten an.',
    title: 'Dargestellte Karten',
    enableBackdrop: true
  },
  {
    anchorId: 'basemap.selector',
    content: 'Wechseln Sie die Hintergrundkarte.',
    title: 'Hintergrund',
    enableBackdrop: true
  },
  {
    anchorId: 'feature.info',
    content: 'Klicken Sie auf Kartenobjekte und erhalten Sie Informationen dazu.',
    title: 'Info-Klick',
    enableBackdrop: false
  },
  {
    anchorId: 'end.tour',
    content: 'Wir wünschen viel Vergnügen bei der Nutzung des GIS-Browsers!',
    title: 'Das wars!',
    enableBackdrop: false
  }
];
