import {Injectable} from '@angular/core';
import {selectData} from '../../core/state/map/reducers/feature-info.reducer';
import {Store} from '@ngrx/store';

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  private readonly featureInfoData$ = this.store.select(selectData);

  constructor(private readonly store: Store) {}

  public printFeatureInfo() {
    console.log('printing');
  }
}
