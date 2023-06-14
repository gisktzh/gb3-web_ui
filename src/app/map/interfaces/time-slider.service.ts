import {Observable} from 'rxjs';
import {TimeExtent} from './time-extent.interface';
import {ActiveMapItem, Gb2WmsMapItemConfiguration} from '../models/active-map-item.model';
import {TimeSliderConfiguration} from '../../shared/interfaces/topic.interface';

export interface TimeSliderService {
  /** Assigns a time slider widget to the given container based on the active map item */
  assignTimeSliderWidget(activeMapItem: ActiveMapItem<Gb2WmsMapItemConfiguration>, container: HTMLDivElement): void;

  /** Returns an observable which fires an event in case the time extent changes for the active map item with the given ID */
  watchTimeExtent(activeMapItemId: string): Observable<TimeExtent>;

  /** Creates a new time extent from the given new time extent. The created time extent will be fully validated against
   * the limitations and rules of the time slider configuration. */
  createValidTimeExtent(timeSliderConfig: TimeSliderConfiguration, newValue: TimeExtent, oldValue?: TimeExtent): TimeExtent;
}
