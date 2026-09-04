import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectActiveBasemapId} from '../../../../state/map/reducers/map-config.reducer';
import {BasemapConfigService} from '../../../services/basemap-config.service';
import {BasemapSelectionListComponent} from './basemap-selection-list/basemap-selection-list.component';
import {BasemapSelectorComponent} from './basemap-selector.component';
import {NgClickOutsideDirective} from 'ng-click-outside2';
import {provideUiTour} from 'ngx-ui-tour-md-menu';
import {Basemap} from 'src/app/shared/interfaces/basemap.interface';

describe('BasemapSelectorComponent', () => {
  let component: BasemapSelectorComponent;
  let fixture: ComponentFixture<BasemapSelectorComponent>;
  let compiled: HTMLElement;
  let store: MockStore;

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

  beforeEach(async () => {
    const basemapConfigServiceMock: Partial<BasemapConfigService> = {
      availableBasemaps,
    };

    await TestBed.configureTestingModule({
      imports: [BasemapSelectorComponent],
      providers: [
        provideMockStore(),
        provideUiTour(),
        {
          provide: BasemapConfigService,
          useValue: basemapConfigServiceMock,
        },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectActiveBasemapId, '');
    store.refreshState();

    fixture = TestBed.createComponent(BasemapSelectorComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the basemap selector button', () => {
    const button = compiled.querySelector('.basemap-selector__active');

    expect(button).toBeTruthy();
    expect(button?.getAttribute('aria-label')).toBe('Hintergrundkarte ändern');
  });

  it('should set the active basemap as the button background image', () => {
    store.overrideSelector(selectActiveBasemapId, 'wms-basemap');
    store.refreshState();
    fixture.detectChanges();

    const button = compiled.querySelector('.basemap-selector__active') as HTMLButtonElement;

    expect(button.style.backgroundImage).toContain('https://www.example.com/image.png');
  });

  it('should not render the basemap selection list when the selection is closed', () => {
    expect(fixture.debugElement.query(By.directive(BasemapSelectionListComponent))).toBeNull();
  });

  it('should render the basemap selection list when the selection is opened', () => {
    component.toggleSelection();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.directive(BasemapSelectionListComponent))).toBeTruthy();
  });

  it('should toggle the selection when the selector button is clicked', () => {
    const button = compiled.querySelector('.basemap-selector__active') as HTMLButtonElement;
    expect(component.isSelectionOpen()).toBe(false);

    button.click();
    fixture.detectChanges();

    expect(component.isSelectionOpen()).toBe(true);

    button.click();
    fixture.detectChanges();

    expect(component.isSelectionOpen()).toBe(false);
  });

  it('should toggle the selection through toggleSelection', () => {
    expect(component.isSelectionOpen()).toBe(false);
    component.toggleSelection();

    expect(component.isSelectionOpen()).toBe(true);

    component.toggleSelection();

    expect(component.isSelectionOpen()).toBe(false);
  });

  it('should close the selection when clicking outside', () => {
    component.toggleSelection();
    fixture.detectChanges();

    compiled.querySelector('div')?.dispatchEvent(new CustomEvent('clickOutside'));

    fixture.detectChanges();

    expect(component.isSelectionOpen()).toBe(false);
    expect(fixture.debugElement.query(By.directive(BasemapSelectionListComponent))).toBeNull();
  });

  it('should close the selection and focus the selector button when the basemap changes', () => {
    component.toggleSelection();
    fixture.detectChanges();

    const selectionList = fixture.debugElement.query(By.directive(BasemapSelectionListComponent))
      .componentInstance as BasemapSelectionListComponent;

    const button = compiled.querySelector('.basemap-selector__active') as HTMLButtonElement;

    expect(component.isSelectionOpen()).toBe(true);

    selectionList.basemapChangedEvent.emit();
    fixture.detectChanges();

    expect(component.isSelectionOpen()).toBe(false);
    expect(document.activeElement).toBe(button);
  });

  it('should focus the selector button when toggling and focusing', () => {
    const button = compiled.querySelector('.basemap-selector__active') as HTMLButtonElement;

    component.toggleSelectionAndFocusBasemapSelectorButton();
    fixture.detectChanges();

    expect(component.isSelectionOpen()).toBe(true);
    expect(document.activeElement).toBe(button);
  });
});
