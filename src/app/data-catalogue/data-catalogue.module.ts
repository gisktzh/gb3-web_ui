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
import {ProductDetailComponent} from './components/product-detail/product-detail.component';
import {KeywordListComponent} from './components/keyword-list/keyword-list.component';
import {DataDisplayComponent} from './components/data-display/data-display.component';
import {DataDisplaySectionComponent} from './components/data-display-section/data-display-section.component';
import {DataCatalogueDetailPageComponent} from './components/data-catalogue-detail-page/data-catalogue-detail-page.component';
import {DataCatalogueDetailPageSectionComponent} from './components/data-catalogue-detail-page-section/data-catalogue-detail-page-section.component';
import {DataCatalogueOverviewItemComponent} from './components/data-catalogue-overview-item/data-catalogue-overview-item.component';

@NgModule({
  declarations: [
    DataCataloguePageComponent,
    DataCatalogueOverviewComponent,
    ServiceDetailComponent,
    DatasetDetailComponent,
    MapDetailComponent,
    ProductDetailComponent,
    KeywordListComponent,
    DataDisplayComponent,
    DataDisplaySectionComponent,
    DataCatalogueDetailPageComponent,
    DataCatalogueDetailPageSectionComponent,
    DataCatalogueOverviewItemComponent,
  ],
  imports: [CommonModule, DataCatalogueRoutingModule, MaterialModule, SharedModule],
})
export class DataCatalogueModule {}
