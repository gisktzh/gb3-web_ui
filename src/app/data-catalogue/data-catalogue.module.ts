import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DataCataloguePageComponent} from './data-catalogue-page.component';
import {DataCatalogueRoutingModule} from './data-catalogue-routing.module';
import {DataCatalogueOverviewComponent} from './components/data-catalogue-overview/data-catalogue-overview.component';
import {DataCatalogueDetailComponent} from './components/data-catalogue-detail/data-catalogue-detail.component';

@NgModule({
  declarations: [DataCataloguePageComponent, DataCatalogueOverviewComponent, DataCatalogueDetailComponent],
  imports: [CommonModule, DataCatalogueRoutingModule]
})
export class DataCatalogueModule {}
