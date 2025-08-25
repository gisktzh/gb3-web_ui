import {Component, Input} from '@angular/core';
import {FeatureInfoResultDisplay} from '../../../../shared/interfaces/feature-info.interface';
import {MapOverlayListItemComponent} from '../../map-overlay/map-overlay-list-item/map-overlay-list-item.component';
import {MatIcon} from '@angular/material/icon';
import {NgTemplateOutlet, NgOptimizedImage} from '@angular/common';
import {FeatureInfoContentComponent} from '../feature-info-content/feature-info-content.component';

@Component({
  selector: 'feature-info-item',
  templateUrl: './feature-info-item.component.html',
  styleUrls: ['./feature-info-item.component.scss'],
  imports: [MapOverlayListItemComponent, MatIcon, NgTemplateOutlet, FeatureInfoContentComponent, NgOptimizedImage],
})
export class FeatureInfoItemComponent {
  @Input() public featureInfo!: FeatureInfoResultDisplay;
  @Input() public showInteractiveElements: boolean = true;
}
