import {Component, Input, OnInit} from '@angular/core';
import {ActiveMapItem} from '../../../models/active-map-item.model';
import {slideInOutAnimation} from '../../../../shared/animations/slideInOut.animation';

type TabType = 'layers' | 'settings';

@Component({
  selector: 'active-map-item',
  templateUrl: './active-map-item.component.html',
  styleUrls: ['./active-map-item.component.scss'],
  animations: [slideInOutAnimation],
})
export class ActiveMapItemComponent implements OnInit {
  @Input() public activeMapItem!: ActiveMapItem;
  @Input() public isFirstActiveMapItem: boolean = false;
  @Input() public isLastActiveMapItem: boolean = false;

  public activeTab: TabType = 'layers';

  public ngOnInit() {
    if (this.activeMapItem.isSingleLayer) {
      this.activeTab = 'settings';
    }
  }

  public changeTabs(tab: TabType) {
    this.activeTab = tab;
  }
}
