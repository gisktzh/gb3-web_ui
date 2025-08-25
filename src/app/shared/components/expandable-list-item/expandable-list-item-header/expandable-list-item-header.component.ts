import {Component, Input} from '@angular/core';
import {LoadingState} from 'src/app/shared/types/loading-state.type';
import {MatBadge} from '@angular/material/badge';
import {NgClass} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {LoadingAndProcessBarComponent} from '../../loading-and-process-bar/loading-and-process-bar.component';

@Component({
  selector: 'expandable-list-item-header',
  templateUrl: './expandable-list-item-header.component.html',
  styleUrls: ['./expandable-list-item-header.component.scss'],
  imports: [MatBadge, NgClass, MatIcon, LoadingAndProcessBarComponent],
})
export class ExpandableListItemHeaderComponent {
  @Input() public title!: string;
  @Input() public isExpanded: boolean = true;
  @Input() public loadingState: LoadingState;
  @Input() public numberOfItems: number = 0;
  @Input() public showBadge: boolean = false;
}
