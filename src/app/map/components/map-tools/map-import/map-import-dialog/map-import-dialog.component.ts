import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {ExternalServiceActiveMapItem} from '../../../../models/external-service.model';
import {Subscription, tap} from 'rxjs';
import {selectTemporaryExternalMapItem} from '../../../../../state/map/reducers/map-import.reducer';

@Component({
  selector: 'map-import-dialog',
  templateUrl: './map-import-dialog.component.html',
  styleUrl: './map-import-dialog.component.scss',
})
export class MapImportDialogComponent implements OnInit, OnDestroy {
  public temporaryExternalMapItem?: ExternalServiceActiveMapItem;
  public externalServiceActiveMapItem?: ExternalServiceActiveMapItem;

  private readonly temporaryExternalMapItem$ = this.store.select(selectTemporaryExternalMapItem);
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
    // if (this.externalServiceActiveMapItem) {
    //   const title = this.thirdStepFormGroup.value.name ?? this.externalServiceActiveMapItem.title;
    //   let activeMapItem: ExternalServiceActiveMapItem;
    //   switch (this.externalServiceActiveMapItem.settings.mapServiceType) {
    //     case 'wms':
    //       activeMapItem = ActiveMapItemFactory.createExternalWmsMapItem(
    //         this.externalServiceActiveMapItem.settings.url,
    //         title,
    //         this.externalServiceActiveMapItem.settings.layers,
    //       );
    //       break;
    //     case 'kml':
    //       activeMapItem = ActiveMapItemFactory.createExternalKmlMapItem(
    //         this.externalServiceActiveMapItem.settings.url,
    //         title,
    //         this.externalServiceActiveMapItem.settings.layers,
    //       );
    //       break;
    //   }
    //   this.store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem, position: 0}));
    // }
    this.close();
  }

  private close() {
    this.dialogRef.close();
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.temporaryExternalMapItem$
        .pipe(tap((temporaryExternalMapItem) => (this.temporaryExternalMapItem = temporaryExternalMapItem)))
        .subscribe(),
    );
  }
}
