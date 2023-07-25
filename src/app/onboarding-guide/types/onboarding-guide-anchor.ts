/**
 * Anchors for the map onboarding guide.
 */
type MapOnboardingGuideAnchor =
  | 'map.start.tour'
  | 'map.catalogue'
  | 'map.active.map.items'
  | 'map.basemap.selector'
  | 'map.feature.info'
  | 'map.end.tour';

/**
 * All TourAnchors that are in use throughout the app. Do not use string anchors or tourAnchor directly, but add new steps and their anchors
 * to this type.
 */
export type OnboardingGuideAnchor = MapOnboardingGuideAnchor;
