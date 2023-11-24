import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../shared/shared.module';
import {TermsOfUsePageComponent} from './terms-of-use-page.component';

const routes: Routes = [
  {
    path: '',
    component: TermsOfUsePageComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule],
})
export class TermsOfUseRoutingModule {}
