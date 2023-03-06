import {Observable} from 'rxjs';
import {TimeSliderExtent} from './time-slider-extent.interface';
import {ActiveMapItem} from '../models/active-map-item.model';

export interface TimeSliderService {
  readonly timeSliderExtentChanged: Observable<TimeSliderExtent>;
  assignTimeSliderWidget(activeMapItem: ActiveMapItem, container: HTMLDivElement): void;
}
