import {CanDeactivateFn} from '@angular/router';
import {FatalErrorPageComponent} from '../../error-handling/components/fatal-error-page/fatal-error-page.component';

export const fatalErrorMapGuard: CanDeactivateFn<FatalErrorPageComponent> = () => {
  return false;
};
