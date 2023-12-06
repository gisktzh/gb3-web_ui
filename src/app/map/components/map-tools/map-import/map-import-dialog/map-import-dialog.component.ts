import {Component, Inject} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {debounceTime, EMPTY, filter, switchMap, tap} from 'rxjs';
import {MAP_LOADER_SERVICE, MAP_SERVICE} from '../../../../../app.module';
import {MapService} from '../../../../interfaces/map.service';
import {MapLoaderService} from '../../../../interfaces/map-loader.service';
import {ExternalServiceActiveMapItem} from '../../../../models/external-service.model';
import {catchError} from 'rxjs/operators';
import {ActiveMapItemActions} from '../../../../../state/map/actions/active-map-item.actions';
import {ActiveMapItemFactory} from '../../../../../shared/factories/active-map-item.factory';
import {MapServiceType} from '../../../../types/map-service.type';

interface FirstStep {
  mapType: FormControl<MapServiceType | null>;
  url: FormControl<string | null>;
}

interface ThirdStep {
  name: FormControl<string | null>;
}

@Component({
  selector: 'map-import-dialog',
  templateUrl: './map-import-dialog.component.html',
  styleUrls: ['./map-import-dialog.component.scss'],
})
export class MapImportDialogComponent {
  public readonly firstStepFormGroup = this.formBuilder.group<FirstStep>({
    mapType: this.formBuilder.control(null, [Validators.required]),
    url: this.formBuilder.control(null, [Validators.required]),
  });
  public readonly thirdStepFormGroup: FormGroup<ThirdStep> = this.formBuilder.group<ThirdStep>({
    name: this.formBuilder.control(null, [Validators.required]),
  });

  public externalServiceActiveMapItem?: ExternalServiceActiveMapItem;

  constructor(
    private readonly dialogRef: MatDialogRef<MapImportDialogComponent>,
    private readonly store: Store,
    private formBuilder: FormBuilder,
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
    @Inject(MAP_LOADER_SERVICE) private readonly mapLoaderService: MapLoaderService,
  ) {
    this.firstStepFormGroup.controls.url.valueChanges
      .pipe(
        debounceTime(300),
        filter((value): value is string => !!value),
        switchMap((value) =>
          this.mapLoaderService.loadExternalService(value, this.firstStepFormGroup.value.mapType!).pipe(
            tap((externalServiceActiveMapItem) => (this.externalServiceActiveMapItem = externalServiceActiveMapItem)),
            catchError((error) => {
              // TODO: error handling
              console.warn(error);
              return EMPTY;
            }),
          ),
        ),
      )
      .subscribe();
  }

  public cancel() {
    this.close();
  }

  public finish() {
    if (this.externalServiceActiveMapItem) {
      const title = this.thirdStepFormGroup.value.name ?? this.externalServiceActiveMapItem.title;
      let activeMapItem: ExternalServiceActiveMapItem;
      switch (this.externalServiceActiveMapItem.settings.mapServiceType) {
        case 'wms':
          activeMapItem = ActiveMapItemFactory.createExternalWmsMapItem(
            this.externalServiceActiveMapItem.settings.url,
            title,
            this.externalServiceActiveMapItem.settings.layers,
          );
          break;
        case 'kml':
          activeMapItem = ActiveMapItemFactory.createExternalKmlMapItem(
            this.externalServiceActiveMapItem.settings.url,
            title,
            this.externalServiceActiveMapItem.settings.layers,
          );
          break;
      }
      this.store.dispatch(ActiveMapItemActions.addActiveMapItem({activeMapItem, position: 0}));
    }
    this.close();
  }

  private close() {
    this.dialogRef.close();
  }
}
