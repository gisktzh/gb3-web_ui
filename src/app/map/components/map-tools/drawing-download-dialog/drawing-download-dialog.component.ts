import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {MatDialogRef} from '@angular/material/dialog';
import {ExportActions} from '../../../../state/map/actions/export.actions';
import {ExportFormat} from '../../../../shared/enums/export-format.enum';
import {FormControl, Validators} from '@angular/forms';
import {Subscription, tap} from 'rxjs';
import {selectExportLoadingState} from '../../../../state/map/reducers/export.reducer';
import {LoadingState} from '../../../../shared/types/loading-state.type';

@Component({
  selector: 'drawing-download-dialog',
  templateUrl: './drawing-download-dialog.component.html',
  styleUrl: './drawing-download-dialog.component.scss',
  standalone: false,
})
export class DrawingDownloadDialogComponent implements OnInit, OnDestroy {
  public availableExportFormats = Object.values(ExportFormat);
  public exportFormat = ExportFormat.Geojson;
  public exportFormatControl = new FormControl('geojson', Validators.required);
  public loadingState: LoadingState = undefined;

  private readonly loadingState$ = this.store.select(selectExportLoadingState);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly store: Store,
    private readonly dialogRef: MatDialogRef<DrawingDownloadDialogComponent>,
  ) {}

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
