import {Component, effect, inject, signal} from '@angular/core';
import {Store} from '@ngrx/store';
import {MatDialogRef} from '@angular/material/dialog';
import {ImportActions} from '../../../../state/map/actions/import.actions';
import {selectLoadingState} from '../../../../state/map/reducers/import.reducer';
import {ApiDialogWrapperComponent} from '../../api-dialog-wrapper/api-dialog-wrapper.component';
import {DropZoneComponent} from '../../../../shared/components/drop-zone/drop-zone.component';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'drawings-import-dialog',
  templateUrl: './drawings-import-dialog.component.html',
  styleUrl: './drawings-import-dialog.component.scss',
  imports: [ApiDialogWrapperComponent, DropZoneComponent, MatButton],
})
export class DrawingsImportDialogComponent {
  private readonly store = inject(Store);
  private readonly dialogRef = inject<MatDialogRef<DrawingsImportDialogComponent>>(MatDialogRef);

  public readonly loadingState = this.store.selectSignal(selectLoadingState);
  protected readonly fileUploadErrorMessage = signal('');

  constructor() {
    effect(() => {
      if (this.loadingState() === 'loaded') {
        this.dialogRef.close();
      }
    });
  }

  public cancel() {
    this.dialogRef.close();
    this.store.dispatch(ImportActions.resetDrawingImportState());
  }

  public handleFileChange(file: Blob | File) {
    this.store.dispatch(ImportActions.requestDrawingsImport({file}));
  }

  public handleFileError(error: string) {
    this.store.dispatch(ImportActions.setFileValidationError({errorMessage: error}));
    this.fileUploadErrorMessage.set(error);
  }
}
