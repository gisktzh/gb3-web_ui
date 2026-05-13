import {Component, input} from '@angular/core';
import {LoadingState} from 'src/app/shared/types/loading-state.type';
import {MatBadge} from '@angular/material/badge';

import {MatIcon} from '@angular/material/icon';
import {LoadingAndProcessBarComponent} from '../../loading-and-process-bar/loading-and-process-bar.component';

@Component({
  selector: 'expandable-list-item-header',
  templateUrl: './expandable-list-item-header.component.html',
  styleUrls: ['./expandable-list-item-header.component.scss'],
  imports: [MatBadge, MatIcon, LoadingAndProcessBarComponent],
})
export class ExpandableListItemHeaderComponent {
  public readonly title = input.required<string>();
  public readonly isExpanded = input(true);
  public readonly loadingState = input<LoadingState>();
  public readonly numberOfItems = input<number | undefined>(0);
  public readonly showBadge = input(false);
}
