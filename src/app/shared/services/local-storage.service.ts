import {Injectable, Signal, WritableSignal, inject, signal} from '@angular/core';
import {LocalStorageKey} from '../types/local-storage-key.type';
import {AbstractStorageService} from './abstract-storage.service';
import {TIME_SERVICE} from '../../app.tokens';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService extends AbstractStorageService<LocalStorageKey> {
  private readonly signals = new Map<LocalStorageKey, WritableSignal<string | null>>();

  constructor() {
    const timeService = inject(TIME_SERVICE);

    super(timeService);
  }

  public set(key: LocalStorageKey, value: string) {
    localStorage.setItem(key, value);
    this.signalFor(key).set(value);
  }

  public get(key: LocalStorageKey): string | null {
    return localStorage.getItem(key);
  }

  public remove(key: LocalStorageKey) {
    localStorage.removeItem(key);
    this.signalFor(key).set(null);
  }

  public watch(key: LocalStorageKey): Signal<string | null> {
    return this.signalFor(key);
  }

  private signalFor(key: LocalStorageKey): WritableSignal<string | null> {
    let valueSignal = this.signals.get(key);

    if (!valueSignal) {
      valueSignal = signal(this.get(key));
      this.signals.set(key, valueSignal);
    }

    return valueSignal;
  }
}
