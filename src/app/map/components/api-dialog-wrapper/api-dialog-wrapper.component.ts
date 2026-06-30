import {Component, input, output} from '@angular/core';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {MatDialogTitle, MatDialogContent, MatDialogActions} from '@angular/material/dialog';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {CdkScrollable} from '@angular/cdk/scrolling';
import {LoadingAndProcessBarComponent} from '../../../shared/components/loading-and-process-bar/loading-and-process-bar.component';
import {HasSavingStateSingal} from 'src/app/shared/interfaces/has-saving-state-signal.interface';

@Component({
  selector: 'api-dialog-wrapper',
  templateUrl: './api-dialog-wrapper.component.html',
  styleUrls: ['./api-dialog-wrapper.component.scss'],
  imports: [MatDialogTitle, MatIconButton, MatIcon, CdkScrollable, MatDialogContent, MatDialogActions, LoadingAndProcessBarComponent],
})
export class ApiDialogWrapperComponent implements HasSavingStateSingal {
  public readonly title = input<string>();
  public readonly savingState = input<LoadingState>();
  public readonly errorText = input('Beim Speichern ist etwas schief gelaufen.');
  public readonly showCloseButton = input(true);

  public readonly closeEvent = output();
}
