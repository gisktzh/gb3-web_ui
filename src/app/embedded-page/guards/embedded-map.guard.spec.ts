import {TestBed} from '@angular/core/testing';
import {ActivatedRouteSnapshot, CanDeactivateFn, RouterStateSnapshot} from '@angular/router';

import {embeddedMapGuard} from './embedded-map.guard';
import {Component} from '@angular/core';

describe('embeddedMapGuard', () => {
  const executeGuard: CanDeactivateFn<any> = (...guardParameters) =>
    TestBed.runInInjectionContext(() => embeddedMapGuard(...guardParameters));
  const dummyRoute = {} as ActivatedRouteSnapshot;
  const dummyState = {url: '/'} as RouterStateSnapshot;
  const dummyComponent = {} as Component;

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should always return `false`', () => {
    expect(executeGuard(dummyComponent, dummyRoute, dummyState, dummyState)).toBeFalse();
  });
});
