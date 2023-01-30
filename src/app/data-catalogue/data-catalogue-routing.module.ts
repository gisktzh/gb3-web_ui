import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../shared/shared.module';
import {DataCataloguePageComponent} from './data-catalogue-page.component';
import {DataCatalogueOverviewComponent} from './components/data-catalogue-overview/data-catalogue-overview.component';
import {GeoServiceDetailComponent} from './components/geo-service-detail/geo-service-detail.component';
import {MapDetailComponent} from './components/map-detail/map-detail.component';
import {GeoDataDetailComponent} from './components/geo-data-detail/geo-data-detail.component';

export type DetailRouteType = 'geodata' | 'geoservice' | 'map';

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
        path: 'geodata/:id',
        component: GeoDataDetailComponent
      },
      {
        path: 'geoservice/:id',
        component: GeoServiceDetailComponent
      },
      {
        path: 'map/:id',
        component: MapDetailComponent
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
