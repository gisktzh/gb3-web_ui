import {DataDownloadConfig} from '../interfaces/data-download-config.interface';

export const dataDownloadConfig: DataDownloadConfig = {
  defaultOrderSrs: 'lv95',
  initialPollingDelay: 10000,
  pollingInterval: 30000,
  maximumNumberOfConsecutiveStatusJobErrors: 10,
};
