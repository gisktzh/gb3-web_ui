// There is an array (`orderStatusKeys`) and a new union type (`OrderStatusType`) for two reasons:
// To be able to extract a union type subset of `ManipulateType` AND to have an array used to check if a given value is in said union type.
// => more infos: https://stackoverflow.com/questions/50085494/how-to-check-if-a-given-value-is-in-a-union-type-array
import {HasLoadingState} from './has-loading-state.interface';

export const orderStatusKeys = ['submitted', 'queued', 'working', 'success', 'failure', 'unknown'] as const; // TS3.4 syntax
export type OrderStatusType = (typeof orderStatusKeys)[number];

export interface OrderStatusJob extends HasLoadingState {
  id: string;
  title: string;
  status?: OrderStatus;
  consecutiveErrorsCount: number;
  /** a value indicating whether the order is completed (either successfully or failed) */
  isCompleted: boolean;
}

export interface OrderStatus {
  finishedDateString: string;
  internalId: number;
  orderId: string;
  status: OrderStatusContent;
  submittedDateString: string;
}

export interface OrderStatusContent {
  type: OrderStatusType;
  message?: string;
}
