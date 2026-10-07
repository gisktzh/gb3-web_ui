import {Component, inject, NO_ERRORS_SCHEMA, OnInit} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {TestBed} from '@angular/core/testing';
import {provideStore, Store} from '@ngrx/store';
import {MapPageComponent} from './map-page.component';
import {reducers} from '../state';
import {SessionStorageService} from '../shared/services/session-storage.service';
import {InitialMapExtentService} from './services/initial-map-extent.service';
import {OnboardingGuideService} from '../onboarding-guide/services/onboarding-guide.service';
import {ShareLinkActions} from '../state/map/actions/share-link.actions';
import {MapConfigActions} from '../state/map/actions/map-config.actions';
import {selectMapConfigState} from '../state/map/reducers/map-config.reducer';

const mapCreated = vi.fn();

@Component({selector: 'map-container', template: ''})
class MapContainerStub implements OnInit {
  private readonly store = inject(Store);
  ngOnInit() {
    mapCreated(this.store.selectSignal(selectMapConfigState)());
  }
}

describe('MapPageComponent share-link initialization', () => {
  const session = {get: vi.fn(), remove: vi.fn()};
  const extent = {calculateInitialExtent: vi.fn(), calculateInitialExtentForPaddedView: vi.fn()};
  const onboarding = {autoStart: vi.fn()};

  beforeEach(() => {
    session.get.mockReturnValue('shared-map');
    extent.calculateInitialExtent.mockReturnValue({x: 10, y: 20, scale: 100});
    extent.calculateInitialExtentForPaddedView.mockReturnValue({x: 10, y: 20, scale: 100});
    TestBed.configureTestingModule({
      imports: [MapPageComponent],
      providers: [
        provideStore(reducers),
        {provide: SessionStorageService, useValue: session},
        {provide: InitialMapExtentService, useValue: extent},
      ],
    }).overrideComponent(MapPageComponent, {
      set: {
        imports: [MapContainerStub, NgTemplateOutlet],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [{provide: OnboardingGuideService, useValue: onboarding}],
      },
    });
  });

  it('creates the map only after restoration, using its saved extent', () => {
    const fixture = TestBed.createComponent(MapPageComponent);
    fixture.detectChanges();
    expect(mapCreated).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('waiting-page')).not.toBeNull();
    const store = TestBed.inject(Store);
    store.dispatch(MapConfigActions.setInitialMapConfig({x: 123, y: 456, scale: 789, basemapId: 'test'}));
    fixture.detectChanges();
    expect(mapCreated).not.toHaveBeenCalled();
    store.dispatch(ShareLinkActions.completeApplicationInitialization());
    fixture.detectChanges();
    expect(mapCreated).toHaveBeenCalledWith(expect.objectContaining({center: {x: 123, y: 456}, scale: 789}));
    expect(fixture.nativeElement.querySelector('waiting-page')).toBeNull();
  });

  it.each(['loading', 'validation'])('shows a usable default map after a %s failure', (failure) => {
    const fixture = TestBed.createComponent(MapPageComponent);
    fixture.detectChanges();
    const store = TestBed.inject(Store);
    store.dispatch(
      failure === 'loading'
        ? ShareLinkActions.setLoadingError({error: new Error('missing link')})
        : ShareLinkActions.setInitializationError({error: new Error('invalid link')}),
    );
    fixture.detectChanges();
    expect(mapCreated).toHaveBeenCalledWith(expect.objectContaining({center: {x: 10, y: 20}, scale: 100}));
  });

  it('renders ordinary map visits without waiting for a share link', () => {
    session.get.mockReturnValue(null);
    const fixture = TestBed.createComponent(MapPageComponent);
    fixture.detectChanges();
    expect(mapCreated).toHaveBeenCalledOnce();
  });
});
