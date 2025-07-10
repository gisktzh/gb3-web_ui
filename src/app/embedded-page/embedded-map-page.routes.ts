import {Routes} from '@angular/router';
import {EmbeddedMapPageComponent} from './embedded-map-page.component';
import {RouteParamConstants} from '../shared/constants/route-param.constants';
import {embeddedMapGuard} from './guards/embedded-map.guard';

export const EMBEDDED_MAP_PAGE_ROUTES: Routes = [
  {
    path: `:${RouteParamConstants.RESOURCE_IDENTIFIER}`,
    component: EmbeddedMapPageComponent,
    canDeactivate: [embeddedMapGuard],
  },
  {
    // also allow empty ID to be routed to the embedded map page
    path: '',
    component: EmbeddedMapPageComponent,
    canDeactivate: [embeddedMapGuard],
  },
];
