import {Component, Input} from '@angular/core';
import {LoadingState} from '../../types/loading-state';
import {ViewProcessState} from '../../types/view-process-state';

@Component({
  selector: 'loading-and-process-bar',
  templateUrl: './loading-and-process-bar.component.html',
  styleUrls: ['./loading-and-process-bar.component.scss'],
})
export class LoadingAndProcessBarComponent {
  @Input() public loadingState: LoadingState = 'undefined';
  @Input() public viewProcessState: ViewProcessState = 'undefined';
}
