import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PlaceholderPageComponent} from './shared/components/placeholder-page/placeholder-page.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {path: 'maps', loadChildren: () => import('./map/map.module').then((m) => m.MapModule)},
      {path: 'data', loadChildren: () => import('./data-catalogue/data-catalogue.module').then((m) => m.DataCatalogueModule)},
      {path: 'shop', component: PlaceholderPageComponent},
      {path: 'help', component: PlaceholderPageComponent},
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
