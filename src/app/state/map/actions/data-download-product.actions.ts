import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {errorProps} from '../../../shared/utils/error-props.utils';
import {ProductsList} from '../../../shared/interfaces/gb3-geoshop-product.interface';

export const DataDownloadProductActions = createActionGroup({
  source: 'DataDownloadProduct',
  events: {
    'Load Products List': emptyProps(),
    'Set Products List': props<{productsList: ProductsList}>(),
    'Set Products List Error': errorProps(),
    'Load Relevant Products Ids': emptyProps(),
    'Set Relevant Products Ids': props<{productIds: string[]}>(),
    'Set Relevant Products Ids Error': errorProps(),
  },
});
