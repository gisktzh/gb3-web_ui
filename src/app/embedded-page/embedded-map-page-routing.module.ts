import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {EmbeddedMapPageComponent} from './embedded-map-page.component';
import {RouteParamConstants} from '../shared/constants/route-param.constants';
import {SharedModule} from '../shared/shared.module';

const routes: Routes = [
  {
    path: `:${RouteParamConstants.RESOURCE_IDENTIFIER}`,
    component: EmbeddedMapPageComponent,
  },
  // TODO WES errorhandling, check if in iframe
  {
    pathMatch: 'full',
    path: '',
    redirectTo: '/',
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
  providers: [],
})
export class EmbeddedMapPageRoutingModule {}
