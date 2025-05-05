import {TestBed} from '@angular/core/testing';
import {ActivatedRouteSnapshot, CanDeactivateFn, RouterStateSnapshot} from '@angular/router';

import {embeddedMapGuard} from './embedded-map.guard';
import {EmbeddedMapPageComponent} from '../embedded-map-page.component';

describe('embeddedMapGuard', () => {
  const executeGuard: CanDeactivateFn<EmbeddedMapPageComponent> = (...guardParameters) =>
    TestBed.runInInjectionContext(() => embeddedMapGuard(...guardParameters));
  const dummyRoute = {} as ActivatedRouteSnapshot;
  const dummyState = {url: '/'} as RouterStateSnapshot;
  const dummyComponent = {} as EmbeddedMapPageComponent;

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
