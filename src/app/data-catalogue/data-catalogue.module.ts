import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DataCataloguePageComponent} from './data-catalogue-page.component';
import {DataCatalogueRoutingModule} from './data-catalogue-routing.module';
import {DataCatalogueOverviewComponent} from './components/data-catalogue-overview/data-catalogue-overview.component';
import {GeoServiceDetailComponent} from './components/geo-service-detail/geo-service-detail.component';
import {GeoDataDetailComponent} from './components/geo-data-detail/geo-data-detail.component';
import {MapDetailComponent} from './components/map-detail/map-detail.component';
import {MaterialModule} from '../shared/external/material.module';

@NgModule({
  declarations: [
    DataCataloguePageComponent,
    DataCatalogueOverviewComponent,
    GeoServiceDetailComponent,
    GeoDataDetailComponent,
    MapDetailComponent
  ],
  imports: [CommonModule, DataCatalogueRoutingModule, MaterialModule]
})
export class DataCatalogueModule {}
