import {Component, input} from '@angular/core';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {MatProgressBar} from '@angular/material/progress-bar';

@Component({
  selector: 'content-loading-state',
  templateUrl: './content-loading-state.component.html',
  styleUrls: ['./content-loading-state.component.scss'],
  imports: [MatProgressBar],
})
export class ContentLoadingStateComponent {
  public readonly loadingState = input<LoadingState>('loading');
  public readonly loadingText = input<string>();
  public readonly loadingCompletedText = input<string>();
}
