import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DataCataloguePageComponent} from './data-catalogue-page.component';
import {DataCatalogueRoutingModule} from './data-catalogue-routing.module';
import {DataCatalogueOverviewComponent} from './components/data-catalogue-overview/data-catalogue-overview.component';
import {ServiceDetailComponent} from './components/service-detail/service-detail.component';
import {DatasetDetailComponent} from './components/dataset-detail/dataset-detail.component';
import {MapDetailComponent} from './components/map-detail/map-detail.component';
import {MaterialModule} from '../shared/external/material.module';
import {SharedModule} from '../shared/shared.module';
import {DataCataloguePlaceholderComponent} from './components/data-catalogue-placeholder/data-catalogue-placeholder.component';
import {ProductDetailComponent} from './components/product-detail/product-detail.component';

@NgModule({
  declarations: [
    DataCataloguePageComponent,
    DataCatalogueOverviewComponent,
    ServiceDetailComponent,
    DatasetDetailComponent,
    MapDetailComponent,
    DataCataloguePlaceholderComponent,
    ProductDetailComponent,
  ],
  imports: [CommonModule, DataCatalogueRoutingModule, MaterialModule, SharedModule],
})
export class DataCatalogueModule {}
