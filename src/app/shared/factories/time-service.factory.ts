import {DayjsService} from '../services/dayjs.service';

export function timeServiceFactory() {
  return new DayjsService();
}
