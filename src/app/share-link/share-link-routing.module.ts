import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ShareLinkRedirectComponent} from './components/share-link-redirect/share-link-redirect.component';
import {ShareLinkConstants} from '../shared/constants/share-link.constants';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: `:${ShareLinkConstants.SHARE_LINK_ID_PARAMETER_NAME}`,
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
