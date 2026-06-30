import {Component, effect, inject, signal} from '@angular/core';
import {Store} from '@ngrx/store';
import {MatDialogRef} from '@angular/material/dialog';
import {ExportActions} from '../../../../state/map/actions/export.actions';
import {ExportFormat} from '../../../../shared/enums/export-format.enum';
import {selectExportLoadingState} from '../../../../state/map/reducers/export.reducer';
import {ApiDialogWrapperComponent} from '../../api-dialog-wrapper/api-dialog-wrapper.component';
import {MatFormField, MatLabel} from '@angular/material/input';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/autocomplete';
import {MatButton} from '@angular/material/button';
import {UpperCasePipe} from '@angular/common';

import {form, required, FormField} from '@angular/forms/signals';

@Component({
  selector: 'drawing-download-dialog',
  templateUrl: './drawing-download-dialog.component.html',
  styleUrl: './drawing-download-dialog.component.scss',
  imports: [ApiDialogWrapperComponent, MatFormField, MatLabel, MatSelect, MatOption, MatButton, UpperCasePipe, FormField],
})
export class DrawingDownloadDialogComponent {
  private readonly store = inject(Store);
  private readonly dialogRef = inject<MatDialogRef<DrawingDownloadDialogComponent>>(MatDialogRef);

  public readonly exportFormatModel = signal<{exportFormat: ExportFormat}>({
    exportFormat: ExportFormat.Geojson,
  });
  public exportFormatForm = form(this.exportFormatModel, (fieldPath) => {
    required(fieldPath.exportFormat);
  });

  public availableExportFormats = Object.values(ExportFormat);
  public readonly loadingState = this.store.selectSignal(selectExportLoadingState);

  constructor() {
    effect(() => {
      if (this.loadingState() === 'loaded') {
        this.dialogRef.close();
      }
    });
  }

  public downloadDrawings() {
    if (this.exportFormatForm().valid()) {
      const exportFormat = this.exportFormatModel().exportFormat;
      this.store.dispatch(ExportActions.requestDrawingsExport({exportFormat}));
    }
  }

  public cancel() {
    this.dialogRef.close();
  }
}
