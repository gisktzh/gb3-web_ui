import {Component, Input} from '@angular/core';
import {ActiveMapItem} from '../../../models/active-map-item.model';
import {slideInOutAnimation} from '../../../../shared/animations/slideInOut.animation';

type TabType = 'layers' | 'settings';

@Component({
  selector: 'active-map-item',
  templateUrl: './active-map-item.component.html',
  styleUrls: ['./active-map-item.component.scss'],
  animations: [slideInOutAnimation]
})
export class ActiveMapItemComponent {
  @Input() public activeMapItem!: ActiveMapItem;

  public activeTab: TabType = 'layers';

  public changeTabs(tab: TabType) {
    this.activeTab = tab;
  }
}
