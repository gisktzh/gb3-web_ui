import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {DataDownloadSelection} from '../../../shared/interfaces/data-download-selection.interface';
import {OrderStatus} from '../../../shared/interfaces/geoshop-order-status.interface';
import {errorProps} from '../../../shared/utils/error-props.utils';
import {Order, OrderResponse} from '../../../shared/interfaces/geoshop-order.interface';

export const DataDownloadOrderActions = createActionGroup({
  source: 'DataDownloadOrder',
  events: {
    'Set Selection': props<{selection: DataDownloadSelection}>(),
    'Clear Selection': emptyProps(),
    'Set Order': props<{order: Order}>(),
    'Send Order': props<{order: Order}>(),
    'Set Order Response': props<{orderResponse: OrderResponse}>(),
    'Set Order Error': errorProps(),
    'Request Order Status': props<{orderId: string}>(),
    'Set Order Status Response': props<{orderStatus: OrderStatus}>(),
    'Set Order Status Error': props<{error?: unknown; orderId: string}>(),
  },
});
