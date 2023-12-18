import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SupportPageComponent} from './support-page.component';
import {FaqComponent} from './components/faq/faq.component';
import {UsefulInformationComponent} from './components/useful-information/useful-information.component';
import {ContactComponent} from './components/contact/contact.component';
import {SupportPage} from '../shared/enums/support-page.enum';

const routes: Routes = [
  {
    path: '',
    component: SupportPageComponent,
    children: [
      {
        path: SupportPage.Faq,
        component: FaqComponent,
      },
      {
        path: SupportPage.UsefulInformation,
        component: UsefulInformationComponent,
      },
      {
        path: SupportPage.Contact,
        component: ContactComponent,
      },
      {
        pathMatch: 'full',
        path: '',
        redirectTo: SupportPage.Faq,
      },
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SupportPageRoutingModule {}
