import {Signal} from '@angular/core';
import {LoadingState} from '../types/loading-state.type';

export interface HasSavingStateSingal {
  savingState: Signal<LoadingState>;
}
