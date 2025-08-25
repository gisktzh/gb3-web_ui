import {NgModule} from '@angular/core';
import {ShareLinkRedirectComponent} from './components/share-link-redirect/share-link-redirect.component';
import {SharedModule} from '../shared/shared.module';
import {ShareLinkRoutingModule} from './share-link-routing.module';

@NgModule({
  imports: [SharedModule, ShareLinkRoutingModule, ShareLinkRedirectComponent],
})
export class ShareLinkModule {}
