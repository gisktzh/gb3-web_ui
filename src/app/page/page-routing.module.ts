import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './components/home/home.component';
import {PageComponent} from './page.component';

const routes: Routes = [
  {
    path: '',
    component: PageComponent,
    children: [
      {path: 'maps', loadChildren: () => import('../map/map.module').then((m) => m.MapModule)},
      {path: '', component: HomeComponent}
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PageRoutingModule {}
