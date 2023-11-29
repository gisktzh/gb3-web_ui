import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../shared/shared.module';
import {PrivacyPageComponent} from './privacy-page.component';

const routes: Routes = [
  {
    path: '',
    component: PrivacyPageComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
})
export class PrivacyRoutingModule {}
