import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {ExternalServiceActiveMapItem} from '../../../map/models/external-service.model';

export interface MapImportState extends HasLoadingState {
  temporaryExternalMapItem: ExternalServiceActiveMapItem | undefined;
  externalMapItem: ExternalServiceActiveMapItem | undefined;
}
