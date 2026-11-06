import {MapOnboardingGuideAnchor} from '../types/onboarding-guide-anchor.type';
import {IStepOption} from 'ngx-ui-tour-md-menu';

/**
 * Ovveride of the default IMdStepOption to force the usage of the MapOnboardingGuideAnchor types, which are also used in the TypedTourAnchor
 * directive.
 */
interface OnboardingStep extends IStepOption {
  anchorId: MapOnboardingGuideAnchor;
  image?: string;
}

/**
 * Configuration object for an onboarding guide. Has a unique ID and a number of steps.
 */
export interface OnboardingGuideConfig {
  id: string;
  steps: OnboardingStep[];
}
