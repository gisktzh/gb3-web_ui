import {createActionGroup, props} from '@ngrx/store';
import {OrderStatus} from '../../../shared/interfaces/geoshop-order-status.interface';

export const DataDownloadOrderStatusJobActions = createActionGroup({
  source: 'DataDownloadOrder',
  events: {
    'Request Order Status': props<{orderId: string; orderTitle: string}>(),
    'Set Order Status Response': props<{orderStatus: OrderStatus}>(),
    'Set Order Status Error': props<{error?: unknown; orderId: string; maximumNumberOfConsecutiveStatusJobErrors: number}>(),
    'Complete Order Status': props<{orderId: string}>(),
    'Cancel Order Status': props<{orderId: string}>(),
  },
});
