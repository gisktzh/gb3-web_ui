import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MainPage} from './shared/enums/main-page.enum';
import {NotFoundErrorPageComponent} from './error-handling/components/not-found-error-page/not-found-error-page.component';
import {FatalErrorPageComponent} from './error-handling/components/fatal-error-page/fatal-error-page.component';
import {authLoadingGuard} from './shared/guards/auth-loading-guard.guard';

const routes: Routes = [
  {
    path: '',
    children: [
      {path: MainPage.Auth, loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule)},
      {path: MainPage.Maps, loadChildren: () => import('./map/map.module').then((m) => m.MapModule)},
      {path: MainPage.Data, loadChildren: () => import('./data-catalogue/data-catalogue.module').then((m) => m.DataCatalogueModule)},
      {path: MainPage.Support, loadChildren: () => import('./support-page/support-page.module').then((m) => m.SupportPageModule)},
      {path: MainPage.Privacy, loadChildren: () => import('./privacy/privacy.module').then((m) => m.PrivacyModule)},
      {path: MainPage.Start, loadChildren: () => import('./start-page/start-page.module').then((m) => m.StartPageModule)},
      {
        path: MainPage.ShareLink,
        loadChildren: () => import('./share-link/share-link.module').then((m) => m.ShareLinkModule),
        canActivate: [authLoadingGuard],
      },
      {
        path: MainPage.Embedded,
        loadChildren: () => import('./embedded-page/embedded-map-page.module').then((m) => m.EmbeddedMapPageModule),
      },
      {path: MainPage.Error, component: FatalErrorPageComponent},
      {path: MainPage.NotFound, component: NotFoundErrorPageComponent},
      {path: '**', component: NotFoundErrorPageComponent},
    ],
  },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule],
})
export class AppRoutingModule {}
