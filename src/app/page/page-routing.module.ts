import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PlaceholderPageComponent} from './components/placeholder-page/placeholder-page.component';
import {PageComponent} from './page.component';

const routes: Routes = [
  {
    path: '',
    component: PageComponent,
    children: [
      {path: 'maps', loadChildren: () => import('../map/map.module').then((m) => m.MapModule)},
      {path: 'data', component: PlaceholderPageComponent},
      {path: 'shop', component: PlaceholderPageComponent},
      {path: 'help', component: PlaceholderPageComponent},
      {path: '', component: PlaceholderPageComponent}
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PageRoutingModule {}
