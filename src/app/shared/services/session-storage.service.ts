import {Injectable} from '@angular/core';
import {SessionStorageKey} from '../types/session-storage-key.type';
import {TimeExtentUtils} from '../utils/time-extent.utils';

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
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
      return TimeExtentUtils.parseUTCDate(value);
    } else {
      return value;
    }
  }
}
