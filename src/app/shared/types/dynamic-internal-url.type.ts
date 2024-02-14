import {LinkObject} from '../interfaces/link-object.interface';

/**
 * Defines the type of the dynamic internal URL which is used as a key in the configuration.
 */
export type DynamicInternalUrlType = 'geolion';

/**
 * Defines the basepath for dynamic internal URLs to allow for runtime-dependent URL replacement.
 */
export type DynamicInternalUrlsConfiguration = {
  [key in DynamicInternalUrlType]: Pick<LinkObject, 'href'>;
};
