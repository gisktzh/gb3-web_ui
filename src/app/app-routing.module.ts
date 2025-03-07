import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MainPage} from './shared/enums/main-page.enum';
import {NotFoundErrorPageComponent} from './error-handling/components/not-found-error-page/not-found-error-page.component';
import {FatalErrorPageComponent} from './error-handling/components/fatal-error-page/fatal-error-page.component';
import {fatalErrorMapGuard} from './embedded-page/guards/fatal-error-page.guard';

const siteOperator = 'Geoportal Kanton Zürich';
const routes: Routes = [
  {
    path: '',
    children: [
      {path: MainPage.Auth, loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule), title: `Login ${siteOperator}`},
      {path: MainPage.Maps, loadChildren: () => import('./map/map.module').then((m) => m.MapModule), title: `GIS-Browser ${siteOperator}`},
      {
        path: MainPage.Data,
        loadChildren: () => import('./data-catalogue/data-catalogue.module').then((m) => m.DataCatalogueModule),
        title: `Geodatenkatalog ${siteOperator}`,
      },
      {
        path: MainPage.Support,
        loadChildren: () => import('./support-page/support-page.module').then((m) => m.SupportPageModule),
        title: `Hilfe & Support ${siteOperator}`,
      },
      {
        path: MainPage.Privacy,
        loadChildren: () => import('./privacy/privacy.module').then((m) => m.PrivacyModule),
        title: `Datenschutz ${siteOperator}`,
      },
      {
        path: MainPage.TermsOfUse,
        loadChildren: () => import('./terms-of-use/terms-of-use.module').then((m) => m.TermsOfUseModule),
        title: `Nutzungshinweise ${siteOperator}`,
      },
      {
        path: MainPage.Start,
        loadChildren: () => import('./start-page/start-page.module').then((m) => m.StartPageModule),
        title: `${siteOperator}`,
      },
      {
        path: MainPage.ShareLink,
        loadChildren: () => import('./share-link/share-link.module').then((m) => m.ShareLinkModule),
        title: `Link teilen ${siteOperator}`,
      },
      {
        path: MainPage.Embedded,
        loadChildren: () => import('./embedded-page/embedded-map-page.module').then((m) => m.EmbeddedMapPageModule),
        title: `GIS-Browser ${siteOperator}`,
      },
      {
        path: MainPage.Apps,
        loadChildren: () => import('./apps-page/apps-page.routes').then((m) => m.APPS_ROUTES),
        title: `Apps ${siteOperator}`,
      },

      {path: MainPage.Error, component: FatalErrorPageComponent, canDeactivate: [fatalErrorMapGuard], title: `Fehler ${siteOperator}`},
      {path: MainPage.NotFound, component: NotFoundErrorPageComponent, title: `Seite nicht gefunden ${siteOperator}`},
      {path: '**', component: NotFoundErrorPageComponent, title: `Seite nicht gefunden ${siteOperator}`},
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule],
})
export class AppRoutingModule {}
