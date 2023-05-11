import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  {
    path: '',
    children: [
      {path: 'auth', loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule)},
      {path: 'maps', loadChildren: () => import('./map/map.module').then((m) => m.MapModule)},
      {path: 'data', loadChildren: () => import('./data-catalogue/data-catalogue.module').then((m) => m.DataCatalogueModule)},
      {path: 'support', loadChildren: () => import('./support-page/support-page.module').then((m) => m.SupportPageModule)},
      {path: '', loadChildren: () => import('./start-page/start-page.module').then((m) => m.StartPageModule)}
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
