import {TimeSliderConfiguration} from '../../shared/interfaces/topic.interface';
import {Observable} from 'rxjs';
import {TimeSliderExtent} from './time-slider-extent.interface';

export interface TimeSliderService {
  readonly timeSliderExtentChanged: Observable<TimeSliderExtent>;
  assignTimeSliderWidget(timeSliderConfig: TimeSliderConfiguration, container: HTMLDivElement): void;
}
