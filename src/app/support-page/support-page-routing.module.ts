import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SupportPageComponent} from './support-page.component';

const routes: Routes = [
  {
    path: '',
    component: SupportPageComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SupportPageRoutingModule {}
