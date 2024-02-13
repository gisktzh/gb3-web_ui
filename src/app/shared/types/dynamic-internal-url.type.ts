import {LinkObject} from '../interfaces/link-object.interface';

export type DynamicInternalUrlType = 'geolion' | 'wmszhch';

export type DynamicInternalUrlsConfiguration = {
  [key in DynamicInternalUrlType]: Pick<LinkObject, 'href'>;
};
