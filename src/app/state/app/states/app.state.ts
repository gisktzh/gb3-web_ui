import {DynamicInternalUrlsConfiguration} from '../../../shared/types/dynamic-internal-url.type';
import {AccessMode} from '../../../shared/types/access-mode.type';

export interface AppState {
  dynamicInternalUrlsConfiguration: DynamicInternalUrlsConfiguration;
  accessMode: AccessMode;
}
