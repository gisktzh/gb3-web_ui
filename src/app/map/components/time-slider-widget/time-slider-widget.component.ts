import {AfterViewInit, Component, ElementRef, Inject, Input, OnDestroy, ViewChild} from '@angular/core';
import {ActiveMapItem} from '../../models/active-map-item.model';
import {Store} from '@ngrx/store';
import {TIME_SLIDER_SERVICE} from '../../../app.module';
import {TimeSliderService} from '../../interfaces/time-slider.service';
import {Subscription, tap} from 'rxjs';
import {ActiveMapItemActions} from '../../../state/map/actions/active-map-item.actions';

@Component({
  selector: 'time-slider-widget',
  templateUrl: './time-slider-widget.component.html',
  styleUrls: ['./time-slider-widget.component.scss']
})
export class TimeSliderWidgetComponent implements AfterViewInit, OnDestroy {
  @Input() public activeMapItem!: ActiveMapItem;
  @ViewChild('timeSlider') private readonly timeSliderContainer!: ElementRef;

  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store, @Inject(TIME_SLIDER_SERVICE) private readonly timeSliderService: TimeSliderService) {}

  public ngAfterViewInit(): void {
    if (this.activeMapItem.timeSliderConfiguration) {
      this.timeSliderService.assignTimeSliderWidget(this.activeMapItem, this.timeSliderContainer.nativeElement);
      this.subscriptions.add(
        this.timeSliderService
          .watchTimeExtent(this.activeMapItem.id)
          .pipe(
            tap((timeExtent) => {
              this.store.dispatch(ActiveMapItemActions.setTimeSliderExtent({timeExtent: timeExtent, activeMapItem: this.activeMapItem}));
            })
          )
          .subscribe()
      );
    }
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
