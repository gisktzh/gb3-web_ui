import {IMdStepOption} from 'ngx-ui-tour-md-menu/lib/step-option.interface';
import {OnboardingGuideAnchor} from '../types/onboarding-guide-anchor';

/**
 * Ovveride of the default IMdStepOption to force the usage of the OnboardingGuideAnchor types, which are also used in the TypedTourAnchor
 * directive.
 */
interface OnboardingStep extends IMdStepOption {
  anchorId: OnboardingGuideAnchor;
}

/**
 * Configuration object for an onboarding guide. Has a unique ID and a number of steps and an optional introduction image.
 */
export interface OnboardingGuideConfig {
  id: string;
  introductionImage?: string;
  steps: OnboardingStep[];
}
