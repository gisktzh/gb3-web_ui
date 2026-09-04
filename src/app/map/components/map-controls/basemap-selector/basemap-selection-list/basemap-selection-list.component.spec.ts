import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {MapConfigActions} from '../../../../../state/map/actions/map-config.actions';
import {selectActiveBasemapId} from '../../../../../state/map/reducers/map-config.reducer';
import {Basemap} from '../../../../../shared/interfaces/basemap.interface';
import {BasemapConfigService} from '../../../../services/basemap-config.service';
import {BasemapSelectionListComponent} from './basemap-selection-list.component';

describe('BasemapSelectionListComponent', () => {
  let component: BasemapSelectionListComponent;
  let fixture: ComponentFixture<BasemapSelectionListComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;
  let basemapChangedEventSpy: Mock;

  const wmsBasemap: Basemap = {
    id: 'wms-basemap',
    title: 'WMS Basemap',
    type: 'wms',
    relativeImagePath: 'https://www.example.com/image.png',
    url: '',
    layers: [],
    srsId: 2056,
  };

  const blankBasemap: Basemap = {
    id: 'blank-basemap',
    title: 'Blank Basemap',
    type: 'blank',
  };

  const availableBasemaps: Basemap[] = [wmsBasemap, blankBasemap];

  const basemapConfigServiceMock: Partial<BasemapConfigService> = {
    availableBasemaps,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasemapSelectionListComponent],
      providers: [
        provideMockStore(),
        {
          provide: BasemapConfigService,
          useValue: basemapConfigServiceMock,
        },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectScreenMode, 'regular');
    store.overrideSelector(selectActiveBasemapId, 'wms-basemap');
    store.refreshState();

    storeDispatchSpy = vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(BasemapSelectionListComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    basemapChangedEventSpy = vi.spyOn(component.basemapChangedEvent, 'emit');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all available basemaps', () => {
    const buttons = compiled.querySelectorAll('.basemap-selection-list__item');

    expect(buttons).toHaveLength(2);
  });

  it('should render the basemap titles', () => {
    const titles = compiled.querySelectorAll('.basemap-selection-list__item__title');

    expect(titles).toHaveLength(2);
    expect(titles[0].textContent?.trim()).toBe('WMS Basemap');
    expect(titles[1].textContent?.trim()).toBe('Blank Basemap');
  });

  it('should render a WMS basemap as an image', () => {
    const image = compiled.querySelector('.basemap-selection-list__item__image') as HTMLImageElement | null;

    expect(image).toBeTruthy();
    expect(image?.alt).toBe('WMS Basemap');
    expect(image?.getAttribute('aria-label')).toBe('WMS Basemap');
    expect(image?.getAttribute('height')).toBe('48');
    expect(image?.getAttribute('width')).toBe('96');
    expect(image?.src).toBeTruthy();
  });

  it('should render a blank basemap with the blank image class', () => {
    const blankImage = compiled.querySelector('.basemap-selection-list__item__image--blank');

    expect(blankImage).toBeTruthy();
    expect(blankImage?.tagName.toLowerCase()).toBe('span');
  });

  it('should render the desktop class in regular screen mode', () => {
    const container = compiled.querySelector('.basemap-selection-list');

    expect(container?.classList.contains('basemap-selection-list--desktop')).toBe(true);
    expect(container?.classList.contains('basemap-selection-list--mobile')).toBe(false);
  });

  it('should render the mobile class in mobile screen mode', () => {
    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();
    fixture.detectChanges();

    const container = compiled.querySelector('.basemap-selection-list');

    expect(container?.classList.contains('basemap-selection-list--mobile')).toBe(true);
    expect(container?.classList.contains('basemap-selection-list--desktop')).toBe(false);
  });

  it('should render the desktop class for a non-mobile screen mode', () => {
    store.overrideSelector(selectScreenMode, 'regular');
    store.refreshState();
    fixture.detectChanges();

    const container = compiled.querySelector('.basemap-selection-list');

    expect(container?.classList.contains('basemap-selection-list--desktop')).toBe(true);
    expect(container?.classList.contains('basemap-selection-list--mobile')).toBe(false);
  });

  it('should mark the active basemap as active', () => {
    store.overrideSelector(selectActiveBasemapId, 'wms-basemap');
    store.refreshState();
    fixture.detectChanges();

    const buttons = compiled.querySelectorAll('.basemap-selection-list__item');

    expect(buttons[0].classList.contains('basemap-selection-list__item--active')).toBe(true);
    expect(buttons[1].classList.contains('basemap-selection-list__item--active')).toBe(false);
  });

  it('should update the active basemap when the selector changes', () => {
    store.overrideSelector(selectActiveBasemapId, 'blank-basemap');
    store.refreshState();
    fixture.detectChanges();

    const buttons = compiled.querySelectorAll('.basemap-selection-list__item');

    expect(buttons[0].classList.contains('basemap-selection-list__item--active')).toBe(false);
    expect(buttons[1].classList.contains('basemap-selection-list__item--active')).toBe(true);
  });

  it('should dispatch the basemap action when a basemap button is clicked', () => {
    const buttons = compiled.querySelectorAll('.basemap-selection-list__item');

    (buttons[0] as HTMLButtonElement).click();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      MapConfigActions.setBasemap({
        activeBasemapId: 'wms-basemap',
      }),
    );
  });

  it('should emit basemapChangedEvent when a basemap button is clicked', () => {
    const buttons = compiled.querySelectorAll('.basemap-selection-list__item');

    (buttons[1] as HTMLButtonElement).click();

    expect(basemapChangedEventSpy).toHaveBeenCalledOnce();
  });

  it('should dispatch and emit when switchBasemap is called directly', () => {
    component.switchBasemap('blank-basemap');

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      MapConfigActions.setBasemap({
        activeBasemapId: 'blank-basemap',
      }),
    );
    expect(basemapChangedEventSpy).toHaveBeenCalledOnce();
  });

  it('should render no basemap buttons when no basemaps are available', () => {
    component.availableBasemaps = [];
    fixture.detectChanges();

    expect(compiled.querySelectorAll('.basemap-selection-list__item')).toHaveLength(0);
  });

  it('should render the WMS image source through the basemap image link pipe', () => {
    const image = compiled.querySelector('.basemap-selection-list__item__image') as HTMLImageElement | null;

    expect(image?.src).toBe('https://www.example.com/image.png');
  });
});
