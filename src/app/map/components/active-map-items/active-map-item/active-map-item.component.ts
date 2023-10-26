import {Component, Input, OnInit} from '@angular/core';
import {ActiveMapItem} from '../../../models/active-map-item.model';

type TabType = 'layers' | 'settings';

@Component({
  selector: 'active-map-item',
  templateUrl: './active-map-item.component.html',
  styleUrls: ['./active-map-item.component.scss'],
})
export class ActiveMapItemComponent implements OnInit {
  @Input() public activeMapItem!: ActiveMapItem;
  @Input() public isFirstActiveMapItem: boolean = false;
  @Input() public isLastActiveMapItem: boolean = false;
  @Input() public isDragAndDropDisabled: boolean = false;

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
