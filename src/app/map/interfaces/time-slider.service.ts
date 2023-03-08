import {Observable} from 'rxjs';
import {TimeExtent} from './time-extent.interface';
import {ActiveMapItem} from '../models/active-map-item.model';
import {TimeSliderConfiguration} from '../../shared/interfaces/topic.interface';

export interface TimeSliderService {
  readonly timeExtentChanged: Observable<TimeExtent>;
  assignTimeSliderWidget(activeMapItem: ActiveMapItem, container: HTMLDivElement): void;

  /** Creates a new time extent by combining the information from the time slider config and the given new and old time extent value */
  createValidTimeExtent(timeSliderConfig: TimeSliderConfiguration, newValue: TimeExtent, oldValue?: TimeExtent): TimeExtent;
}
