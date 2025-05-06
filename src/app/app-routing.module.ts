import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MainPage} from './shared/enums/main-page.enum';
import {NotFoundErrorPageComponent} from './error-handling/components/not-found-error-page/not-found-error-page.component';
import {FatalErrorPageComponent} from './error-handling/components/fatal-error-page/fatal-error-page.component';
import {fatalErrorMapGuard} from './embedded-page/guards/fatal-error-page.guard';
import {environment} from '../environments/environment';

const siteOperator = 'Geoportal Kanton Zürich';
const createRouteTitle = (title?: string): string => {
  let routeTitle = '';
  if (title) {
    routeTitle = `${title} `;
  }
  if (environment.production || environment.stagePrefix === undefined) {
    return `${routeTitle}${siteOperator}`;
  }

  return `[${environment.stagePrefix}] ${routeTitle}${siteOperator}`;
};
const routes: Routes = [
  {
    path: '',
    children: [
      {path: MainPage.Auth, loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule), title: createRouteTitle('Login')},
      {
        path: MainPage.Maps,
        loadChildren: () => import('./map/map.module').then((m) => m.MapModule),
        title: createRouteTitle('GIS-Browser'),
      },
      {
        path: MainPage.Data,
        loadChildren: () => import('./data-catalogue/data-catalogue.module').then((m) => m.DataCatalogueModule),
        title: createRouteTitle('Geodatenkatalog'),
      },
      {
        path: MainPage.Support,
        loadChildren: () => import('./support-page/support-page.module').then((m) => m.SupportPageModule),
        title: createRouteTitle('Hilfe & Support'),
      },
      {
        path: MainPage.Privacy,
        loadChildren: () => import('./privacy/privacy.module').then((m) => m.PrivacyModule),
        title: createRouteTitle('Datenschutz'),
      },
      {
        path: MainPage.TermsOfUse,
        loadChildren: () => import('./terms-of-use/terms-of-use.module').then((m) => m.TermsOfUseModule),
        title: createRouteTitle('Nutzungshinweise'),
      },
      {
        path: MainPage.Start,
        loadChildren: () => import('./start-page/start-page.module').then((m) => m.StartPageModule),
        title: createRouteTitle(),
      },
      {
        path: MainPage.ShareLink,
        loadChildren: () => import('./share-link/share-link.module').then((m) => m.ShareLinkModule),
        title: createRouteTitle('Link teilen'),
      },
      {
        path: MainPage.Embedded,
        loadChildren: () => import('./embedded-page/embedded-map-page.module').then((m) => m.EmbeddedMapPageModule),
        title: createRouteTitle('GIS-Browser'),
      },
      {
        path: MainPage.Apps,
        loadChildren: () => import('./apps-page/apps-page.routes').then((m) => m.APPS_ROUTES),
        title: createRouteTitle('Apps'),
      },

      {path: MainPage.Error, component: FatalErrorPageComponent, canDeactivate: [fatalErrorMapGuard], title: createRouteTitle('Fehler')},
      {path: MainPage.NotFound, component: NotFoundErrorPageComponent, title: createRouteTitle('Seite nicht gefunden')},
      {path: '**', component: NotFoundErrorPageComponent, title: createRouteTitle('Seite nicht gefunden')},
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule],
})
export class AppRoutingModule {}
