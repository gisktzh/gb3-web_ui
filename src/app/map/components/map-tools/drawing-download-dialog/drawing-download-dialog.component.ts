import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {MatDialogRef} from '@angular/material/dialog';
import {ExportActions} from '../../../../state/map/actions/export.actions';
import {ExportFormat} from '../../../../shared/enums/export-format.enum';
import {FormControl, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Subscription, tap} from 'rxjs';
import {selectExportLoadingState} from '../../../../state/map/reducers/export.reducer';
import {LoadingState} from '../../../../shared/types/loading-state.type';
import {ApiDialogWrapperComponent} from '../../api-dialog-wrapper/api-dialog-wrapper.component';
import {MatFormField, MatLabel} from '@angular/material/input';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/autocomplete';
import {MatButton} from '@angular/material/button';
import {UpperCasePipe} from '@angular/common';

@Component({
  selector: 'drawing-download-dialog',
  templateUrl: './drawing-download-dialog.component.html',
  styleUrl: './drawing-download-dialog.component.scss',
  imports: [
    ApiDialogWrapperComponent,
    FormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    ReactiveFormsModule,
    MatOption,
    MatButton,
    UpperCasePipe,
  ],
})
export class DrawingDownloadDialogComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly dialogRef = inject<MatDialogRef<DrawingDownloadDialogComponent>>(MatDialogRef);

  public availableExportFormats = Object.values(ExportFormat);
  public exportFormat = ExportFormat.Geojson;
  public exportFormatControl = new FormControl('geojson', Validators.required);
  public loadingState: LoadingState = undefined;

  private readonly loadingState$ = this.store.select(selectExportLoadingState);
  private readonly subscriptions: Subscription = new Subscription();

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public downloadDrawings(exportFormat: ExportFormat) {
    this.store.dispatch(ExportActions.requestDrawingsExport({exportFormat}));
  }

  public cancel() {
    this.dialogRef.close();
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.exportFormatControl.valueChanges.pipe(tap((value) => (this.exportFormat = value as ExportFormat))).subscribe(),
    );
    this.subscriptions.add(
      this.loadingState$
        .pipe(
          tap((loadingState) => {
            this.loadingState = loadingState;
            if (loadingState === 'loaded') {
              this.dialogRef.close();
            }
          }),
        )
        .subscribe(),
    );
  }
}
