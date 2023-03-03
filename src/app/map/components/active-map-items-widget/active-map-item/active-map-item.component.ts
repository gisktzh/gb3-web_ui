import {AfterViewInit, Component, ElementRef, Inject, Input, ViewChild} from '@angular/core';
import {ActiveMapItem} from '../../../models/active-map-item.model';
import {ActiveMapItemActions} from '../../../../state/map/actions/active-map-item.actions';
import {Store} from '@ngrx/store';
import {MapLayer} from '../../../../shared/interfaces/topic.interface';
import {CdkDrag, CdkDragDrop} from '@angular/cdk/drag-drop';
import {TIME_SLIDER_SERVICE} from '../../../../app.module';
import {TimeSliderService} from '../../../interfaces/time-slider.service';

@Component({
  selector: 'active-map-item',
  templateUrl: './active-map-item.component.html',
  styleUrls: ['./active-map-item.component.scss']
})
export class ActiveMapItemComponent implements AfterViewInit {
  @Input() public activeMapItem!: ActiveMapItem;
  @ViewChild('timeSlider') private readonly timeSliderContainer!: ElementRef;

  constructor(private readonly store: Store, @Inject(TIME_SLIDER_SERVICE) private readonly timeSliderService: TimeSliderService) {}

  public ngAfterViewInit(): void {
    if (this.activeMapItem.timeSliderConfiguration) {
      this.timeSliderService.assignTimeSliderWidget(this.activeMapItem.timeSliderConfiguration, this.timeSliderContainer.nativeElement);
    }
  }

  public trackByLayerId(index: number, item: MapLayer) {
    return item.id;
  }

  public toggleSublayerVisibility(activeMapItem: ActiveMapItem, layerId: number) {
    const sublayer = activeMapItem.layers.find((l) => l.id === layerId);
    if (sublayer) {
      this.store.dispatch(ActiveMapItemActions.setSublayerVisibility({visible: !sublayer.visible, activeMapItem, layerId}));
    }
  }

  public dropSublayer($event: CdkDragDrop<CdkDrag>, activeMapItem: ActiveMapItem) {
    this.store.dispatch(
      ActiveMapItemActions.reorderSublayer({activeMapItem, previousPosition: $event.previousIndex, currentPosition: $event.currentIndex})
    );
  }

  public onOpacitySliderChange(opacity: number, activeMapItem: ActiveMapItem) {
    this.store.dispatch(ActiveMapItemActions.setOpacity({opacity, activeMapItem}));
  }
}
