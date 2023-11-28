import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {errorProps} from '../../../shared/utils/error-props.utils';
import {Product} from '../../../shared/interfaces/gb3-geoshop-product.interface';
import {DataDownloadFilter, DataDownloadFilterCategory} from '../../../shared/interfaces/data-download-filter.interface';

export const DataDownloadProductActions = createActionGroup({
  source: 'DataDownloadProduct',
  events: {
    'Load Products And Relevant Products': emptyProps(),
    'Load Products': emptyProps(),
    'Set Products': props<{products: Product[]}>(),
    'Set Products Error': errorProps(),
    'Load Relevant Product Ids': emptyProps(),
    'Set Relevant Product Ids': props<{relevantProductIds: string[]}>(),
    'Set Relevant Product Ids Error': errorProps(),
    'Set Filter Term': props<{term: string}>(),
    'Clear Filter Term': emptyProps(),
    'Set Filters': props<{filters: DataDownloadFilter[]}>(),
    'Toggle Filter': props<{category: DataDownloadFilterCategory; value: string}>(),
    'Reset Filters': emptyProps(),
    'Reset Filters And Term': emptyProps(),
  },
});
