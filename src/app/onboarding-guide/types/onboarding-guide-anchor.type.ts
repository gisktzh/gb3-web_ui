/**
 * Anchors for the map onboarding guide.
 */
type MapOnboardingGuideAnchor =
  | 'map.tour.start'
  | 'map.tour.end'
  | 'map.search.input'
  | 'map.search.filter'
  | 'map.available-maps'
  | 'map.active-maps'
  | 'map.tools'
  | 'map.navigation'
  | 'map.background'
  | 'map.info';

/**
 * All TourAnchors that are in use throughout the app. Do not use string anchors or tourAnchor directly, but add new steps and their anchors
 * to this type.
 */
export type OnboardingGuideAnchor = MapOnboardingGuideAnchor;
