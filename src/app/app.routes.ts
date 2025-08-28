import {Routes} from '@angular/router';
import {MainPage} from './shared/enums/main-page.enum';
import {NotFoundErrorPageComponent} from './error-handling/components/not-found-error-page/not-found-error-page.component';
import {FatalErrorPageComponent} from './error-handling/components/fatal-error-page/fatal-error-page.component';
import {fatalErrorMapGuard} from './embedded-page/guards/fatal-error-page.guard';
import {environment} from '../environments/environment';

const siteOperator = 'Geoportal Kanton Zürich';
const createRouteTitle = (title?: string): string => {
  const routeTitle = title ? `${title} ` : '';
  if (environment.production || environment.stagePrefix === undefined) {
    return `${routeTitle}${siteOperator}`;
  }

  return `[${environment.stagePrefix}] ${routeTitle}${siteOperator}`;
};
export const APP_ROUTES: Routes = [
  {
    path: '',
    children: [
      {path: MainPage.Auth, loadChildren: () => import('./auth/auth.routes').then((r) => r.AUTH_ROUTES), title: createRouteTitle('Login')},
      {
        path: MainPage.Maps,
        loadChildren: () => import('./map/map.routes').then((r) => r.MAP_ROUTES),
        title: createRouteTitle('GIS-Browser'),
      },
      {
        path: MainPage.Data,
        loadChildren: () => import('./data-catalogue/data-catalogue.routes').then((r) => r.DATA_CATALOGUE_ROUTES),
        title: createRouteTitle('Geodatenkatalog'),
      },
      {
        path: MainPage.Support,
        loadChildren: () => import('./support-page/support-page.routes').then((r) => r.SUPPORT_PAGE_ROUTES),
        title: createRouteTitle('Hilfe & Support'),
      },
      {
        path: MainPage.Privacy,
        loadChildren: () => import('./privacy/privacy.routes').then((r) => r.PRIVACY_ROUTES),
        title: createRouteTitle('Datenschutz'),
      },
      {
        path: MainPage.TermsOfUse,
        loadChildren: () => import('./terms-of-use/terms-of-use.routes').then((r) => r.TERMS_OF_USE_ROUTES),
        title: createRouteTitle('Nutzungshinweise'),
      },
      {
        path: MainPage.Start,
        loadChildren: () => import('./start-page/start-page.routes').then((r) => r.START_PAGE_ROUTES),
        title: createRouteTitle(),
      },
      {
        path: MainPage.ShareLink,
        loadChildren: () => import('./share-link/share-link.routes').then((r) => r.SHARE_LINK_ROUTES),
        title: createRouteTitle('Link teilen'),
      },
      {
        path: MainPage.Embedded,
        loadChildren: () => import('./embedded-page/embedded-map-page.routes').then((r) => r.EMBEDDED_MAP_PAGE_ROUTES),
        title: createRouteTitle('GIS-Browser'),
      },
      {
        path: MainPage.Apps,
        loadChildren: () => import('./apps-page/apps-page.routes').then((r) => r.APPS_ROUTES),
        title: createRouteTitle('Apps'),
      },

      {path: MainPage.Error, component: FatalErrorPageComponent, canDeactivate: [fatalErrorMapGuard], title: createRouteTitle('Fehler')},
      {path: MainPage.NotFound, component: NotFoundErrorPageComponent, title: createRouteTitle('Seite nicht gefunden')},
      {path: '**', component: NotFoundErrorPageComponent, title: createRouteTitle('Seite nicht gefunden')},
    ],
  },
];
