import {TimesliderConfiguration} from '../../shared/interfaces/topic.interface';

export interface TimesliderService {
  assignTimesliderWidget(timesliderConfig: TimesliderConfiguration, container: HTMLDivElement): void;
}
