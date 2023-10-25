import {createActionGroup, props} from '@ngrx/store';
import {MainPage} from '../../../shared/enums/main-page.enum';

export const UrlActions = createActionGroup({
  source: 'Url',
  events: {
    'Set Page': props<{mainPage: MainPage | undefined; isHeadlessPage: boolean; isSimplifiedPage: boolean}>(),
  },
});