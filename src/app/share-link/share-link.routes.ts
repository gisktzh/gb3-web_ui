import {Routes} from '@angular/router';
import {ShareLinkRedirectComponent} from './components/share-link-redirect/share-link-redirect.component';
import {RouteParamConstants} from '../shared/constants/route-param.constants';

export const SHARE_LINK_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: `:${RouteParamConstants.RESOURCE_IDENTIFIER}`,
        component: ShareLinkRedirectComponent,
      },
      {
        pathMatch: 'full',
        path: '',
        redirectTo: '/',
      },
    ],
  },
];
