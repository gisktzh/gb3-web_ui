import {Observable} from 'rxjs';
import {TimeExtent} from './time-extent.interface';
import {ActiveMapItem} from '../models/active-map-item.model';

export interface TimeSliderService {
  readonly timeExtentChanged: Observable<TimeExtent>;
  assignTimeSliderWidget(activeMapItem: ActiveMapItem, container: HTMLDivElement): void;
}
