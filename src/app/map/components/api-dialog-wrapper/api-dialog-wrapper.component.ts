import {Component, Input} from '@angular/core';
import {HasSavingState} from '../../../shared/interfaces/has-saving-state.interface';
import {SavingState} from '../../../shared/types/saving-state';

@Component({
  selector: 'api-dialog-wrapper',
  templateUrl: './api-dialog-wrapper.component.html',
  styleUrls: ['./api-dialog-wrapper.component.scss']
})
export class ApiDialogWrapperComponent implements HasSavingState {
  @Input() public title: string = '';
  @Input() public savingState: SavingState | undefined;
}
