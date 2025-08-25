import {Routes} from '@angular/router';
import {DataCataloguePageComponent} from './data-catalogue-page.component';
import {DataCatalogueOverviewComponent} from './components/data-catalogue-overview/data-catalogue-overview.component';
import {ServiceDetailComponent} from './components/service-detail/service-detail.component';
import {MapDetailComponent} from './components/map-detail/map-detail.component';
import {DatasetDetailComponent} from './components/dataset-detail/dataset-detail.component';
import {ProductDetailComponent} from './components/product-detail/product-detail.component';
import {DataCataloguePage} from '../shared/enums/data-catalogue-page.enum';
import {RouteParamConstants} from '../shared/constants/route-param.constants';

export const DATA_CATALOGUE_ROUTES: Routes = [
  {
    path: '',
    component: DataCataloguePageComponent,
    children: [
      {
        path: '',
        component: DataCatalogueOverviewComponent,
      },
      {
        path: `${DataCataloguePage.Datasets}/:${RouteParamConstants.RESOURCE_IDENTIFIER}`,
        component: DatasetDetailComponent,
      },
      {
        path: `${DataCataloguePage.Services}/:${RouteParamConstants.RESOURCE_IDENTIFIER}`,
        component: ServiceDetailComponent,
      },
      {
        path: `${DataCataloguePage.Maps}/:${RouteParamConstants.RESOURCE_IDENTIFIER}`,
        component: MapDetailComponent,
      },
      {
        path: `${DataCataloguePage.Products}/:${RouteParamConstants.RESOURCE_IDENTIFIER}`,
        component: ProductDetailComponent,
      },
    ],
  },
];
