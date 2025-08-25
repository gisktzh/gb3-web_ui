import {Routes} from '@angular/router';
import {SupportPageComponent} from './support-page.component';
import {FaqComponent} from './components/faq/faq.component';
import {UsefulInformationComponent} from './components/useful-information/useful-information.component';
import {ContactComponent} from './components/contact/contact.component';
import {SupportPage} from '../shared/enums/support-page.enum';

export const SUPPORT_PAGE_ROUTES: Routes = [
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
