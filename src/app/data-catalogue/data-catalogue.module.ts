import {NgModule} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {DataCataloguePageComponent} from './data-catalogue-page.component';
import {DataCatalogueRoutingModule} from './data-catalogue-routing.module';
import {DataCatalogueOverviewComponent} from './components/data-catalogue-overview/data-catalogue-overview.component';
import {ServiceDetailComponent} from './components/service-detail/service-detail.component';
import {DatasetDetailComponent} from './components/dataset-detail/dataset-detail.component';
import {MapDetailComponent} from './components/map-detail/map-detail.component';
import {MaterialModule} from '../shared/external/material.module';
import {SharedModule} from '../shared/shared.module';
import {ProductDetailComponent} from './components/product-detail/product-detail.component';
import {DataDisplaySectionComponent} from './components/data-display-section/data-display-section.component';
import {DataCatalogueDetailPageComponent} from './components/data-catalogue-detail-page/data-catalogue-detail-page.component';
import {DataCatalogueDetailPageSectionComponent} from './components/data-catalogue-detail-page-section/data-catalogue-detail-page-section.component';
import {DataCatalogueFilterDialogComponent} from './components/data-catalogue-filter-dialog/data-catalogue-filter-dialog.component';
import {DatasetElementDetailComponent} from './components/dataset-detail/dataset-element-detail/dataset-element-detail.component';
import {DataDisplayComponent} from './components/data-display/data-display.component';
import {OverviewSearchResultItemComponent} from '../shared/components/data-catalogue-overview-item/overview-search-result-item.component';
import {FormatLineBreaksPipe} from '../shared/pipes/format-line-breaks.pipe';
import {GenericUnorderedListComponent} from '../shared/components/lists/generic-unordered-list/generic-unordered-list.component';

@NgModule({
  declarations: [
    DataCataloguePageComponent,
    DataCatalogueOverviewComponent,
    ServiceDetailComponent,
    DatasetDetailComponent,
    MapDetailComponent,
    ProductDetailComponent,
    DataDisplaySectionComponent,
    DataCatalogueDetailPageComponent,
    DataCatalogueDetailPageSectionComponent,
    DataCatalogueFilterDialogComponent,
  ],
  imports: [
    CommonModule,
    DataCatalogueRoutingModule,
    MaterialModule,
    SharedModule,
    DatasetElementDetailComponent,
    DataDisplayComponent,
    OverviewSearchResultItemComponent,
    NgOptimizedImage,
    FormatLineBreaksPipe,
    GenericUnorderedListComponent,
  ],
  exports: [],
})
export class DataCatalogueModule {}
