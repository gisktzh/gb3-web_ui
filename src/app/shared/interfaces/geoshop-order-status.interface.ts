// There is an array (`orderStatusKeys`) and a new union type (`OrderStatusType`) for two reasons:
// To be able to extract a union type subset of `ManipulateType` AND to have an array used to check if a given value is in said union type.
// => more infos: https://stackoverflow.com/questions/50085494/how-to-check-if-a-given-value-is-in-a-union-type-array
export const orderStatusKeys = ['submitted', 'queued', 'working', 'success', 'failure', 'unknown'] as const; // TS3.4 syntax
export type OrderStatusType = (typeof orderStatusKeys)[number];

export interface OrderStatus {
  finished: string;
  internalId: number;
  orderId: string;
  status: {
    type: OrderStatusType;
    message?: string;
  };
  submitted: string;
}
