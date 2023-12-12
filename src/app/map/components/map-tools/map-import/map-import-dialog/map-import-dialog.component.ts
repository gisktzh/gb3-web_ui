import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {ExternalServiceActiveMapItem} from '../../../../models/external-service.model';
import {Subscription, tap} from 'rxjs';
import {selectExternalMapItem, selectLayerSelections, selectTitle} from '../../../../../state/map/reducers/map-import.reducer';
import {LoadingState} from '../../../../../shared/types/loading-state.type';
import {ExternalLayerSelection} from '../../../../../shared/interfaces/external-layer-selection.interface';
import {selectIsAnyLayerSelected} from '../../../../../state/map/selectors/map-import-layer-selection.selector';
import {MapImportActions} from '../../../../../state/map/actions/map-import.actions';

@Component({
  selector: 'map-import-dialog',
  templateUrl: './map-import-dialog.component.html',
  styleUrl: './map-import-dialog.component.scss',
})
export class MapImportDialogComponent implements OnInit, OnDestroy {
  public loadingState: LoadingState;
  public externalMapItem?: ExternalServiceActiveMapItem;
  public layerSelections: ExternalLayerSelection[] | undefined = undefined;
  public isAnyLayerSelected = false;
  public title: string | undefined = undefined;

  private readonly externalMapItem$ = this.store.select(selectExternalMapItem);
  private readonly layerSelections$ = this.store.select(selectLayerSelections);
  private readonly isAnyLayerSelected$ = this.store.select(selectIsAnyLayerSelected);
  private readonly title$ = this.store.select(selectTitle);
  private readonly subscriptions = new Subscription();

  constructor(
    private readonly dialogRef: MatDialogRef<MapImportDialogComponent>,
    private readonly store: Store,
  ) {}

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public cancel() {
    this.close();
  }

  public finish() {
    this.store.dispatch(MapImportActions.addExternalMapItem());
    this.close();
  }

  private close() {
    this.dialogRef.close();
  }

  private initSubscriptions() {
    this.subscriptions.add(this.externalMapItem$.pipe(tap((externalMapItem) => (this.externalMapItem = externalMapItem))).subscribe());
    this.subscriptions.add(this.layerSelections$.pipe(tap((layerSelections) => (this.layerSelections = layerSelections))).subscribe());
    this.subscriptions.add(
      this.isAnyLayerSelected$.pipe(tap((isAnyLayerSelected) => (this.isAnyLayerSelected = isAnyLayerSelected))).subscribe(),
    );
    this.subscriptions.add(this.title$.pipe(tap((title) => (this.title = title))).subscribe());
  }
}
