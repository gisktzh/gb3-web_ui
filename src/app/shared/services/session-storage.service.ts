import {Injectable} from '@angular/core';
import {SessionStorageKey} from '../types/session-storage-key.type';
import {TimeExtentUtils} from '../utils/time-extent.utils';
import dayjs from 'dayjs';

@Injectable({
  providedIn: 'root',
})
export class SessionStorageService {
  public set(key: SessionStorageKey, value: string) {
    sessionStorage.setItem(key, value);
  }

  public get(key: SessionStorageKey): string | null {
    return sessionStorage.getItem(key);
  }

  public remove(key: SessionStorageKey) {
    sessionStorage.removeItem(key);
  }

  // Returns a date in the correct format after parsing from stringified Object
  public reviver(key: string, value: any) {
    if (typeof value === 'string' && dayjs(value).isValid()) {
      return TimeExtentUtils.parseUTCDate(value);
    } else {
      return value;
    }
  }
}
