import {CanDeactivateFn} from '@angular/router';
import {EmbeddedMapPageComponent} from '../embedded-map-page.component';

/**
 * This guard simply prevents every navigation to any other site.
 */
export const embeddedMapGuard: CanDeactivateFn<EmbeddedMapPageComponent> = () => {
  return false;
};
