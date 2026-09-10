import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {selectIsElevationProfileOverlayVisible} from '../../../state/map/reducers/map-ui.reducer';
import {selectData, selectLoadingState} from '../../../state/map/reducers/elevation-profile.reducer';
import {SwisstopoApiService} from '../../../shared/services/apis/swisstopo/swisstopo-api.service';
import {ElevationProfileOverlayComponent} from './elevation-profile-overlay.component';
import {ElevationProfileData} from '../../../shared/interfaces/elevation-profile.interface';

describe('ElevationProfileOverlayComponent', () => {
  let component: ElevationProfileOverlayComponent;
  let fixture: ComponentFixture<ElevationProfileOverlayComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  const elevationProfileData: ElevationProfileData = {
    dataPoints: [],
    statistics: {
      highestPoint: 100,
      lowestPoint: 90,
      linearDistance: 1000,
      groundDistance: 1100,
      elevationDifference: 10,
    },
    csvRequest: {
      url: 'https://example.test/elevation-profile.csv',
      params: new URLSearchParams(),
    },
  };

  const swisstopoApiServiceMock: Partial<SwisstopoApiService> = {
    createDownloadLinkUrl: vi.fn((data) => (data === undefined ? undefined : 'https://example.test/elevation-profile.csv')),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [ElevationProfileOverlayComponent],
      providers: [{provide: SwisstopoApiService, useValue: swisstopoApiServiceMock}, provideMockStore()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectIsElevationProfileOverlayVisible, false);
    store.overrideSelector(selectData, undefined);
    store.overrideSelector(selectLoadingState, undefined);
    store.refreshState();

    storeDispatchSpy = vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(ElevationProfileOverlayComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not create a download URL if no elevation profile data is given', () => {
    expect(component.downloadCsvUrl()).toBe(undefined);
  });

  it('should create the download URL from the current elevation profile data', () => {
    store.overrideSelector(selectLoadingState, 'loaded');
    store.overrideSelector(selectData, elevationProfileData);
    store.overrideSelector(selectIsElevationProfileOverlayVisible, true);
    store.refreshState();
    fixture.detectChanges();

    expect(swisstopoApiServiceMock.createDownloadLinkUrl).toHaveBeenCalledWith(elevationProfileData);
    expect(component.downloadCsvUrl()).toBe('https://example.test/elevation-profile.csv');
  });

  it('should not render the elevation profile content while loading', () => {
    store.overrideSelector(selectLoadingState, 'loading');
    store.overrideSelector(selectData, elevationProfileData);
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.querySelector('.elevation-profile-overlay__content')).toBeNull();
  });

  it('should not render the elevation profile content when loading has failed', () => {
    store.overrideSelector(selectLoadingState, 'error');
    store.overrideSelector(selectData, elevationProfileData);
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.querySelector('.elevation-profile-overlay__content')).toBeNull();
  });

  it('should not render the elevation profile content when no data is available', () => {
    store.overrideSelector(selectLoadingState, 'loaded');
    store.overrideSelector(selectData, undefined);
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.querySelector('.elevation-profile-overlay__content')).toBeNull();
  });

  it('should render the elevation profile content when loading is complete and data is available', () => {
    store.overrideSelector(selectLoadingState, 'loaded');
    store.overrideSelector(selectData, elevationProfileData);
    store.overrideSelector(selectIsElevationProfileOverlayVisible, true);
    store.refreshState();
    fixture.detectChanges();

    const content = compiled.querySelector('.elevation-profile-overlay__content');

    expect(content).not.toBeNull();
    expect(content?.querySelector('elevation-profile-chart')).not.toBeNull();
    expect(content?.querySelector('elevation-profile-statistics')).not.toBeNull();

    const downloadLink = content?.querySelector<HTMLAnchorElement>('.elevation-profile-overlay__content__download__button');

    expect(downloadLink).not.toBeNull();
    expect(downloadLink?.getAttribute('href')).toBe('https://example.test/elevation-profile.csv');
    expect(downloadLink?.textContent).toContain('Download CSV');

    expect(content?.querySelector('mat-divider')).not.toBeNull();

    const links = Array.from(content?.querySelectorAll<HTMLAnchorElement>('.elevation-profile-overlay__content__credits a') ?? []);

    expect(links).toHaveLength(2);
    expect(links[0]?.getAttribute('href')).toBe('https://api3.geo.admin.ch/services/sdiservices.html#profile');
    expect(links[0]?.getAttribute('target')).toBe('_blank');
    expect(links[0]?.textContent).toContain('GeoAdmin API');
    expect(links[1]?.getAttribute('href')).toBe('https://www.geo.admin.ch/');
    expect(links[1]?.getAttribute('target')).toBe('_blank');
    expect(links[1]?.textContent).toContain('Bundesamt für Landestopografie swisstopo');
  });

  it('should dispatch the action to close the overlay', () => {
    component.close();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: '[MapUi] Set Elevation Profile Overlay Visibility',
        isVisible: false,
      }),
    );
  });

  it('should dispatch the close action when the map overlay emits closeEvent', () => {
    store.overrideSelector(selectIsElevationProfileOverlayVisible, true);
    store.refreshState();
    fixture.detectChanges();

    const mapOverlay = compiled.querySelector('map-overlay');
    expect(mapOverlay).not.toBeNull();

    mapOverlay?.dispatchEvent(new CustomEvent('closeEvent'));

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: '[MapUi] Set Elevation Profile Overlay Visibility',
        isVisible: false,
      }),
    );
  });
});
