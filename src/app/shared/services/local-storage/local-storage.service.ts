import {Injectable} from '@angular/core';
import {LocalStorageKey} from './local-storage-key';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  public set(key: LocalStorageKey, value: string) {
    localStorage.setItem(key, value);
  }

  public get(key: LocalStorageKey): string | null {
    return localStorage.getItem(key);
  }
}
