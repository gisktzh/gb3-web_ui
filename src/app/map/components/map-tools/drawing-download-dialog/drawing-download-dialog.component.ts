import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {MatDialogRef} from '@angular/material/dialog';
import {ExportActions} from '../../../../state/map/actions/export.actions';
import {ExportFormat} from '../../../../shared/types/export-format.type';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';

@Component({
  selector: 'drawing-download-dialog',
  templateUrl: './drawing-download-dialog.component.html',
  styleUrl: './drawing-download-dialog.component.scss',
})
export class DrawingDownloadDialogComponent implements OnInit, OnDestroy {
  public availableExportFormats: string[] = Object.values(ExportFormat);
  public exportFormat: ExportFormat = ExportFormat.GEOJSON;
  public readonly formGroup: FormGroup = new FormGroup({
    exportFormat: new FormControl('geojson', [Validators.required]),
  });

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

  public downloadDrawings() {
    this.store.dispatch(ExportActions.requestDrawingsExport({exportFormat: this.exportFormat}));
  }

  public cancel() {
    this.dialogRef.close();
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.formGroup.valueChanges.subscribe((value) => {
        this.exportFormat = value.exportFormat;
      }),
    );
  }
}
