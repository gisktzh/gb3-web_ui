import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {DataDownloadSelection} from '../../../shared/interfaces/data-download-selection.interface';
import {errorProps} from '../../../shared/utils/error-props.utils';
import {Products} from '../../../shared/interfaces/geoshop-product.interface';
import {OrderStatus} from '../../../shared/interfaces/geoshop-order-status.interface';

export const DataDownloadActions = createActionGroup({
  source: 'DataDownload',
  events: {
    'Set Selection': props<{selection: DataDownloadSelection}>(),
    'Clear Selection': emptyProps(),
    'Load Products': emptyProps(),
    'Set Products': props<{products: Products}>(),
    'Set Products Error': errorProps(),
    'Set Order Status': props<{orderStatus: OrderStatus}>(),
  },
});
