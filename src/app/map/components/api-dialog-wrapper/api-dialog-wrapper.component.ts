import {Component, EventEmitter, Input, Output} from '@angular/core';
import {HasSavingState} from '../../../shared/interfaces/has-saving-state.interface';
import {LoadingState} from '../../../shared/types/loading-state.type';

@Component({
  selector: 'api-dialog-wrapper',
  templateUrl: './api-dialog-wrapper.component.html',
  styleUrls: ['./api-dialog-wrapper.component.scss'],
})
export class ApiDialogWrapperComponent implements HasSavingState {
  @Input() public title: string = '';
  @Input() public savingState: LoadingState;
  @Input() public errorText?: string = 'Beim Speichern ist etwas schief gelaufen.';
  @Input() public showCloseButton: boolean = true;

  @Output() public readonly closeEvent = new EventEmitter<void>();

  public close() {
    this.closeEvent.emit();
  }
}
