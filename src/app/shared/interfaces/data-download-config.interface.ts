import {OrderSrs} from './geoshop-order.interface';

export interface DataDownloadConfig {
  defaultOrderSrs: OrderSrs;
  /** The waiting time in ms before the frist polling request starts */
  initialPollingDelay: number;
  /** Polling interval in ms to check for any changes in the order status job */
  pollingInterval: number;
  /** Maximum number of consecutive errors while polling the status job before terminating it */
  maximumNumberOfConsecutiveStatusJobErrors: number;
}
