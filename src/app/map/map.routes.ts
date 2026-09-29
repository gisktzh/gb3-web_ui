import {Routes} from '@angular/router';
import {MapPageComponent} from './map-page.component';
import {provideMapRuntime} from './map-runtime.providers';

export const MAP_ROUTES: Routes = [
  {
    path: '',
    component: MapPageComponent,
    providers: [provideMapRuntime()],
  },
];
