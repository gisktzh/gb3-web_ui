import {HasLoadingState} from '../../../shared/interfaces/has-loading-state.interface';
import {Legend} from '../../../shared/interfaces/legend.interface';

export interface LegendState extends HasLoadingState {
  items: Legend[];
}
