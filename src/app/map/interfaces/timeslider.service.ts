import {TimesliderConfiguration} from '../../shared/interfaces/topic.interface';
import {Observable} from 'rxjs';
import {TimesliderExtent} from './timeslider-extent.interface';

export interface TimesliderService {
  readonly timesliderExtentChanged: Observable<TimesliderExtent>;
  assignTimesliderWidget(timesliderConfig: TimesliderConfiguration, container: HTMLDivElement): void;
}
