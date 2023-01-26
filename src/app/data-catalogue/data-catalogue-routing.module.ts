import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../shared/shared.module';
import {DataCataloguePageComponent} from './data-catalogue-page.component';
import {DataCatalogueOverviewComponent} from './components/data-catalogue-overview/data-catalogue-overview.component';
import {DataCatalogueDetailComponent} from './components/data-catalogue-detail/data-catalogue-detail.component';

const routes: Routes = [
  {
    path: '',
    component: DataCataloguePageComponent,
    children: [
      {
        path: '',
        component: DataCatalogueOverviewComponent
      },
      {
        path: ':id',
        component: DataCatalogueDetailComponent
      }
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes), SharedModule],
  exports: [RouterModule]
})
export class DataCatalogueRoutingModule {}
