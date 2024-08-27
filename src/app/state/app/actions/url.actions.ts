import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {Params} from '@angular/router';

export const UrlActions = createActionGroup({
  source: 'Url',
  events: {
    'Set Page': props<{mainPage: MainPage | undefined; isHeadlessPage: boolean; isSimplifiedPage: boolean}>(),
    'Set App Params': props<{params: Params}>(),
    'Set Map Page Params': props<{params: Params}>(),
    'Keep Temporary Url Parameters': emptyProps(),
  },
});
