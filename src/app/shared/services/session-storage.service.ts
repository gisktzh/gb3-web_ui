import {Inject, Injectable} from '@angular/core';
import {SessionStorageKey} from '../types/session-storage-key.type';
import {AbstractStorageService} from './abstract-storage.service';
import {TIME_SERVICE} from '../../app.module';
import {TimeService} from '../interfaces/time-service.interface';

@Injectable({
  providedIn: 'root',
})
export class SessionStorageService extends AbstractStorageService<SessionStorageKey> {
  constructor(@Inject(TIME_SERVICE) timeService: TimeService) {
    super(timeService);
  }

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
