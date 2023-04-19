import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DataCataloguePageComponent} from './data-catalogue-page.component';
import {DataCatalogueRoutingModule} from './data-catalogue-routing.module';
import {DataCatalogueOverviewComponent} from './components/data-catalogue-overview/data-catalogue-overview.component';
import {GeoServiceDetailComponent} from './components/geo-service-detail/geo-service-detail.component';
import {GeoDataDetailComponent} from './components/geo-data-detail/geo-data-detail.component';
import {MapDetailComponent} from './components/map-detail/map-detail.component';
import {MaterialModule} from '../shared/external/material.module';
import {SharedModule} from '../shared/shared.module';
import {DataCataloguePlaceholderComponent} from './components/data-catalogue-placeholder/data-catalogue-placeholder.component';

@NgModule({
  declarations: [
    DataCataloguePageComponent,
    DataCatalogueOverviewComponent,
    GeoServiceDetailComponent,
    GeoDataDetailComponent,
    MapDetailComponent,
    DataCataloguePlaceholderComponent
  ],
  imports: [CommonModule, DataCatalogueRoutingModule, MaterialModule, SharedModule]
})
export class DataCatalogueModule {}
