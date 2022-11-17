import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MapPageComponent} from './map-page.component';
import {SharedModule} from '../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: MapPageComponent
  }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule]
})
export class MapRoutingModule {}
