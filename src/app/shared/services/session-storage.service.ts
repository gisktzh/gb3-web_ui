import {Injectable} from '@angular/core';
import {SessionStorageKey} from '../types/session-storage-key.type';

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
}
