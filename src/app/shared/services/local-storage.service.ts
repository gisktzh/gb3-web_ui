import {Inject, Injectable} from '@angular/core';
import {LocalStorageKey} from '../types/local-storage-key.type';
import {AbstractStorageService} from './abstract-storage.service';
import {TIME_SERVICE} from '../../app.module';
import {TimeService} from '../interfaces/time-service.interface';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService extends AbstractStorageService<LocalStorageKey> {
  constructor(@Inject(TIME_SERVICE) timeService: TimeService) {
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
