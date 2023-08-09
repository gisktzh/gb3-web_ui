import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SupportPageComponent} from './support-page.component';
import {FaqComponent} from './components/faq/faq.component';
import {ContactComponent} from './components/contact/contact.component';
import {UsefulLinksComponent} from './components/useful-links/useful-links.component';

const routes: Routes = [
  {
    path: '',
    component: SupportPageComponent,
    children: [
      {
        path: 'faq',
        component: FaqComponent,
      },
      {
        path: 'useful-links',
        component: UsefulLinksComponent,
      },
      {
        path: 'contact',
        component: ContactComponent,
      },
      {
        pathMatch: 'full',
        path: '',
        redirectTo: 'faq',
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
