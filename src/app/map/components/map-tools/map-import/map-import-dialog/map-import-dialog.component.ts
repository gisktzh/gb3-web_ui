import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {selectTitle} from '../../../../../state/map/reducers/map-import.reducer';
import {LoadingState} from '../../../../../shared/types/loading-state.type';
import {selectIsAnyLayerSelected} from '../../../../../state/map/selectors/map-import-layer-selection.selector';
import {MapImportActions} from '../../../../../state/map/actions/map-import.actions';
import {selectLoadingState} from '../../../../../state/map/reducers/external-map-item.reducer';

@Component({
  selector: 'map-import-dialog',
  templateUrl: './map-import-dialog.component.html',
  styleUrl: './map-import-dialog.component.scss',
})
export class MapImportDialogComponent implements OnInit, OnDestroy {
  public externalServiceLoadingState: LoadingState;
  public isAnyLayerSelected = false;
  public title: string | undefined = undefined;

  private readonly externalServiceLoadingState$ = this.store.select(selectLoadingState);
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

  private initSubscriptions() {
    this.subscriptions.add(
      this.isAnyLayerSelected$.pipe(tap((isAnyLayerSelected) => (this.isAnyLayerSelected = isAnyLayerSelected))).subscribe(),
    );
    this.subscriptions.add(this.title$.pipe(tap((title) => (this.title = title))).subscribe());
    this.subscriptions.add(
      this.externalServiceLoadingState$.pipe(tap((loadingState) => (this.externalServiceLoadingState = loadingState))).subscribe(),
    );
  }
}
