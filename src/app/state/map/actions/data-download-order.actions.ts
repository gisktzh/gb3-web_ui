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
    'Update Products In Order': props<{productId: number; formatIds: number[]}>(),
    'Remove Products With Same Id In Order': props<{productId: number}>(),
    'Set Email In Order': props<{email?: string}>(),
    'Send Order': emptyProps(),
    'Set Send Order Response': props<{orderResponse: OrderResponse}>(),
    'Set Send Order Error': errorProps(),
    'Request Order Status': props<{orderId: string}>(),
    'Set Order Status Response': props<{orderStatus: OrderStatus}>(),
    'Set Order Status Error': props<{error?: unknown; orderId: string}>(),
  },
});
