import {Component, inject} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {selectTitle} from '../../../../../state/map/reducers/map-import.reducer';
import {selectIsAnyLayerSelected} from '../../../../../state/map/selectors/map-import-layer-selection.selector';
import {MapImportActions} from '../../../../../state/map/actions/map-import.actions';
import {selectLoadingState} from '../../../../../state/map/reducers/external-map-item.reducer';
import {ApiDialogWrapperComponent} from '../../../api-dialog-wrapper/api-dialog-wrapper.component';
import {MatStepper, MatStep} from '@angular/material/stepper';
import {MapImportServiceAndUrlComponent} from '../map-import-service-and-url/map-import-service-and-url.component';
import {MapImportLayerListComponent} from '../map-import-layer-list/map-import-layer-list.component';
import {MapImportDisplayNameComponent} from '../map-import-display-name/map-import-display-name.component';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'map-import-dialog',
  templateUrl: './map-import-dialog.component.html',
  styleUrl: './map-import-dialog.component.scss',
  imports: [
    ApiDialogWrapperComponent,
    MatStepper,
    MatStep,
    MapImportServiceAndUrlComponent,
    MapImportLayerListComponent,
    MapImportDisplayNameComponent,
    MatButton,
  ],
})
export class MapImportDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<MapImportDialogComponent>>(MatDialogRef);
  private readonly store = inject(Store);

  public readonly externalServiceLoadingState = this.store.selectSignal(selectLoadingState);
  public readonly isAnyLayerSelected = this.store.selectSignal(selectIsAnyLayerSelected);
  public readonly title = this.store.selectSignal(selectTitle);

  public cancel() {
    this.store.dispatch(MapImportActions.clearAll());
    this.close();
  }

  public finish() {
    this.store.dispatch(MapImportActions.importExternalMapItem());
    this.close();
  }

  private close() {
    this.dialogRef.close();
  }
}
