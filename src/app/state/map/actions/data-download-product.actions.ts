import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {errorProps} from '../../../shared/utils/error-props.utils';
import {Products} from '../../../shared/interfaces/geoshop-product.interface';

export const DataDownloadProductActions = createActionGroup({
  source: 'DataDownloadProduct',
  events: {
    'Load Products': emptyProps(),
    'Set Products': props<{products: Products}>(),
    'Set Products Error': errorProps(),
  },
});
