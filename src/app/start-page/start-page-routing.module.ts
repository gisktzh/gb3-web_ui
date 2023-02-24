import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../shared/shared.module';
import {StartPageComponent} from './start-page.component';

const routes: Routes = [
  {
    path: '',
    component: StartPageComponent
  }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule]
})
export class StartPageRoutingModule {}
