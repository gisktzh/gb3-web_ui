import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ShareLinkRedirectComponent} from './components/share-link-redirect/share-link-redirect.component';
import {RouteParamConstants} from '../shared/constants/route-param.constants';

const routes: Routes = [
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

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShareLinkRoutingModule {}
