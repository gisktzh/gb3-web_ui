import {Component, Input} from '@angular/core';
import {LoadingState} from '../../../shared/types/loading-state';

@Component({
  selector: 'content-loading-state',
  templateUrl: './content-loading-state.component.html',
  styleUrls: ['./content-loading-state.component.scss']
})
export class ContentLoadingStateComponent {
  @Input() public loadingState: LoadingState = 'loading';

  @Input() public loadingText?: string;
  @Input() public loadingCompletedText?: string;
}
