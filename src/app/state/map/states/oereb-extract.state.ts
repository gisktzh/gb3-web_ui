import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {OerebExtractQueryLocation, OerebExtractResponse} from 'src/app/shared/interfaces/oereb-extract.interface';

export interface OerebExtractState extends HasLoadingState {
  queryLocation: OerebExtractQueryLocation;
  data: OerebExtractResponse | null;
}
