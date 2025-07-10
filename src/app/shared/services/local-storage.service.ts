import {Injectable, inject} from '@angular/core';
import {LocalStorageKey} from '../types/local-storage-key.type';
import {AbstractStorageService} from './abstract-storage.service';
import {TimeService} from '../interfaces/time-service.interface';
import {TIME_SERVICE} from '../../app.tokens';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService extends AbstractStorageService<LocalStorageKey> {
  constructor() {
    const timeService = inject<TimeService>(TIME_SERVICE);

    super(timeService);
  }

  public set(key: LocalStorageKey, value: string) {
    localStorage.setItem(key, value);
  }

  public get(key: LocalStorageKey): string | null {
    return localStorage.getItem(key);
  }

  public remove(key: LocalStorageKey) {
    localStorage.removeItem(key);
  }
}
