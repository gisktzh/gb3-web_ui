import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {selectItems} from '../../../../state/map/selectors/active-map-items.selector';
import {ActiveMapItemSettingsComponent} from './active-map-item-settings.component';
import {ActiveMapItem} from '../../../models/active-map-item.model';
import {Gb2WmsActiveMapItem} from '../../../models/implementations/gb2-wms.model';
import {Component, input, inputBinding, signal} from '@angular/core';
import {TimeExtent} from '../../../interfaces/time-extent.interface';
import {Map, TimeSliderConfiguration} from '../../../../shared/interfaces/topic.interface';
import {immerable} from 'immer';
import {provideNativeDateAdapter} from '@angular/material/core';
import {TimeSliderComponent} from '../../time-slider/time-slider.component';
import {By} from '@angular/platform-browser';

describe('ActiveMapItemSettingsComponent', () => {
  let component: ActiveMapItemSettingsComponent;
  let fixture: ComponentFixture<ActiveMapItemSettingsComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  const activeMapItem = signal<ActiveMapItem>(createActiveMapItem());

  @Component({
    selector: 'time-slider',
    template: '<div>timeslider</div>',
  })
  class MockTimeSliderComponent {
    public readonly initialTimeExtent = input.required<TimeExtent>();
    public readonly timeSliderConfiguration = input.required<TimeSliderConfiguration>();
  }

  function createActiveMapItem(
    overrides: Partial<Gb2WmsActiveMapItem> = {},
    timeSliderConfiguration: object | null = {},
  ): Gb2WmsActiveMapItem {
    const data = {
      id: 'map-1',
      settings: {
        type: 'gb2Wms',
        ...overrides.settings,
      },
      ...overrides,
    };

    return new Gb2WmsActiveMapItem(
      {id: 'map-1', timeSliderConfiguration} as Map,
      undefined,
      true,
      data.opacity,
      data.settings.timeSliderExtent,
      data.settings.filterConfigurations,
    );
  }

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [ActiveMapItemSettingsComponent],
      providers: [provideMockStore(), provideNativeDateAdapter()],
    })
      .overrideComponent(ActiveMapItemSettingsComponent, {
        remove: {
          imports: [TimeSliderComponent],
        },
        add: {
          imports: [MockTimeSliderComponent],
        },
      })
      .compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectItems, []);
    store.refreshState();

    storeDispatchSpy = vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(ActiveMapItemSettingsComponent, {
      bindings: [inputBinding('activeMapItem', activeMapItem)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the opacity from the active map item', () => {
    activeMapItem.set(createActiveMapItem({opacity: 0.75}));
    fixture.detectChanges();

    expect(component.currentOpacity()).toBe(0.75);
    expect(component.formattedCurrentOpacity()).toBe('75%');
  });

  it('should use one opacity when the active map item has no opacity', () => {
    activeMapItem.set(createActiveMapItem({opacity: undefined}));
    fixture.detectChanges();

    expect(component.currentOpacity()).toBe(1);
    expect(component.formattedCurrentOpacity()).toBe('100%');
  });

  it('should update the displayed opacity when the active map item changes', () => {
    activeMapItem.set(createActiveMapItem({opacity: 0.1234}));
    fixture.detectChanges();

    expect(component.formattedCurrentOpacity()).toBe('12%');
  });

  it('should dispatch the opacity when the component is initialized', () => {
    activeMapItem.set(createActiveMapItem({opacity: 0.6}));
    fixture.detectChanges();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining('Set Opacity'),
        opacity: 0.6,
        activeMapItem: activeMapItem(),
      }),
    );
  });

  it('should render the opacity slider', () => {
    const slider = compiled.querySelector('.active-map-item-settings__transparency__slider');

    expect(slider).not.toBeNull();

    const sliderInput = compiled.querySelector<HTMLInputElement>('input[matSliderThumb]');

    expect(sliderInput).not.toBeNull();
  });

  it('should render the time slider when the active map item has a time slider configuration and extent', () => {
    const timeSliderExtent: TimeExtent = {
      start: new Date('2025-01-01T00:00:00.000Z'),
      end: new Date('2025-12-31T00:00:00.000Z'),
    };

    activeMapItem.set(
      createActiveMapItem({
        settings: {
          type: 'gb2Wms',
          timeSliderExtent,
          url: '',
          isNoticeMarkedAsRead: false,
          mapId: '',
          layers: [],
          [immerable]: true,
        },
      }),
    );
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(MockTimeSliderComponent))).not.toBeNull();
    expect(compiled.querySelector('.active-map-item-settings__divider')).not.toBeNull();
  });

  it('should not render the time slider when there is no time slider configuration', () => {
    activeMapItem.set(
      createActiveMapItem(
        {
          settings: {
            type: 'gb2Wms',
            timeSliderExtent: {
              start: new Date('2025-01-01T00:00:00.000Z'),
              end: new Date('2025-12-31T00:00:00.000Z'),
            } as TimeExtent,
            url: '',
            isNoticeMarkedAsRead: false,
            mapId: '',
            layers: [],
            [immerable]: true,
          },
        },
        null,
      ),
    );
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(MockTimeSliderComponent))).toBeNull();
  });

  it('should not render the time slider when there is no time slider extent', () => {
    activeMapItem.set(
      createActiveMapItem({
        settings: {
          type: 'gb2Wms',
          url: '',
          isNoticeMarkedAsRead: false,
          mapId: '',
          layers: [],
          [immerable]: true,
        },
      }),
    );
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(MockTimeSliderComponent))).toBeNull();
  });

  it('should not render the time slider for a non-gb2Wms active map item', () => {
    activeMapItem.set({
      ...createActiveMapItem(),
      settings: {
        type: 'externalService',
      },
    } as ActiveMapItem);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(MockTimeSliderComponent))).toBeNull();
  });

  it('should report the gb2 WMS map item with a time slider', () => {
    const timeSliderExtent = {
      start: new Date('2025-01-01T00:00:00.000Z'),
      end: new Date('2025-12-31T00:00:00.000Z'),
    } as TimeExtent;

    const item = createActiveMapItem({
      settings: {
        type: 'gb2Wms',
        timeSliderExtent,
        url: '',
        isNoticeMarkedAsRead: false,
        mapId: '',
        layers: [],
        [immerable]: true,
      },
    });

    activeMapItem.set(item);
    fixture.detectChanges();

    expect(component.gb2WmsActiveMapItemWithTimeslider()).toBe(item);
  });

  it('should return null when the active map item does not have a time slider', () => {
    activeMapItem.set(
      createActiveMapItem({
        settings: {
          type: 'gb2Wms',
          url: '',
          isNoticeMarkedAsRead: false,
          mapId: '',
          layers: [],
          [immerable]: true,
        },
      }),
    );
    fixture.detectChanges();

    expect(component.gb2WmsActiveMapItemWithTimeslider()).toBeNull();
  });

  it('should show the attribute filter when filter configurations exist', () => {
    activeMapItem.set(
      createActiveMapItem({
        settings: {
          type: 'gb2Wms',
          filterConfigurations: [
            {
              filterValues: [],
              name: '',
              parameter: '',
            },
          ],
          url: '',
          isNoticeMarkedAsRead: false,
          mapId: '',
          layers: [],
          [immerable]: true,
        },
      }),
    );
    fixture.detectChanges();

    expect(component.hasAttributeFilter()).toBeTruthy();
    expect(compiled.querySelector('.active-map-item-settings__attribute-filter')).not.toBeNull();
    expect(compiled.querySelector('.active-map-item-settings__attribute-filter__button')).not.toBeNull();
  });

  it('should not show the attribute filter for a non-gb2Wms map item', () => {
    activeMapItem.set({
      ...createActiveMapItem(),
      settings: {
        type: 'externalService',
        mapServiceType: 'wms',
        imageFormat: 'png',
        url: '',
        layers: [],
        [immerable]: true,
      },
      addToMap: vi.fn(),
    });
    fixture.detectChanges();

    expect(component.hasAttributeFilter()).toBeFalsy();
    expect(compiled.querySelector('.active-map-item-settings__attribute-filter')).toBeNull();
  });

  it('should not show the attribute filter when there are no filter configurations', () => {
    activeMapItem.set(
      createActiveMapItem({
        settings: {
          type: 'gb2Wms',
          url: '',
          isNoticeMarkedAsRead: false,
          mapId: 'yes',
          layers: [],
          [immerable]: true,
        },
      }),
    );
    fixture.detectChanges();

    expect(component.hasAttributeFilter()).toBeFalsy();
    expect(compiled.querySelector('.active-map-item-settings__attribute-filter')).toBeNull();
  });

  it('should count active filter values across all filter configurations', () => {
    const item = createActiveMapItem({
      settings: {
        type: 'gb2Wms',
        filterConfigurations: [
          {
            filterValues: [
              {
                isActive: true,
                name: '',
                values: [],
              },
              {
                isActive: false,
                name: '',
                values: [],
              },
            ],
            name: '',
            parameter: '',
          },
          {
            filterValues: [
              {
                isActive: true,
                name: '',
                values: [],
              },
              {
                isActive: true,
                name: '',
                values: [],
              },
              {
                isActive: false,
                name: '',
                values: [],
              },
            ],
            name: '',
            parameter: '',
          },
        ],
        url: '',
        isNoticeMarkedAsRead: false,
        mapId: 'yes',
        layers: [],
        [immerable]: true,
      },
    });

    store.overrideSelector(selectItems, [item]);
    store.refreshState();
    fixture.detectChanges();

    activeMapItem.set(item);
    fixture.detectChanges();

    expect(component.numberOfChangedFilters()).toBe(3);

    const badge = compiled.querySelector('.active-map-item-settings__attribute-filter__badge');
    expect(badge).not.toBeNull();
  });

  it('should not render the changed-filter badge when no filters are active', () => {
    const item = createActiveMapItem({
      settings: {
        type: 'gb2Wms',
        filterConfigurations: [
          {
            filterValues: [
              {
                isActive: false,
                name: 'a',
                values: [],
              },
              {
                isActive: false,
                name: 'b',
                values: [],
              },
            ],
            name: '',
            parameter: '',
          },
        ],
        url: '',
        isNoticeMarkedAsRead: false,
        mapId: '',
        layers: [],
        [immerable]: true,
      },
    });

    store.overrideSelector(selectItems, [item]);
    store.refreshState();

    activeMapItem.set(item);
    fixture.detectChanges();

    expect(component.numberOfChangedFilters()).toBe(0);
    expect(compiled.querySelector('.active-map-item-settings__attribute-filter__badge')).toBeNull();
  });

  it('should return zero changed filters when the active map item is not in the store', () => {
    const item = createActiveMapItem({
      settings: {
        type: 'gb2Wms',
        filterConfigurations: [
          {
            filterValues: [
              {
                isActive: true,
                name: 'a',
                values: [],
              },
            ],
            name: '',
            parameter: '',
          },
        ],
        url: '',
        isNoticeMarkedAsRead: false,
        mapId: '',
        layers: [],
        [immerable]: true,
      },
    });

    store.overrideSelector(selectItems, []);
    store.refreshState();

    activeMapItem.set(item);
    fixture.detectChanges();

    expect(component.numberOfChangedFilters()).toBe(0);
  });

  it('should return zero changed filters when the stored item has no filter configurations', () => {
    const item = createActiveMapItem({
      settings: {
        type: 'gb2Wms',
        url: '',
        isNoticeMarkedAsRead: false,
        mapId: '',
        layers: [],
        [immerable]: true,
      },
    });

    store.overrideSelector(selectItems, [item]);
    store.refreshState();

    activeMapItem.set(item);
    fixture.detectChanges();

    expect(component.numberOfChangedFilters()).toBe(0);
  });

  it('should dispatch the map attribute filter action when the attribute filter button is clicked', () => {
    const item = createActiveMapItem({
      settings: {
        type: 'gb2Wms',
        filterConfigurations: [
          {
            filterValues: [],
            name: 'a',
            parameter: 'a',
          },
        ],
        url: '',
        isNoticeMarkedAsRead: false,
        mapId: '',
        layers: [],
        [immerable]: true,
      },
    });

    activeMapItem.set(item);
    fixture.detectChanges();

    const button = compiled.querySelector<HTMLButtonElement>('.active-map-item-settings__attribute-filter__button');

    expect(button).not.toBeNull();

    button?.click();

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining('Set Map Attribute Filters Item Id'),
      }),
    );
  });

  it('should dispatch the new time slider extent', () => {
    const item = createActiveMapItem({
      settings: {
        type: 'gb2Wms',
        timeSliderConfiguration: {
          name: 'a',
          dateFormat: 'Y-m-d',
          minimumDate: '1970-01-01',
          maximumDate: '1990-01-15',
          alwaysMaxRange: false,
          sourceType: 'layer',
          source: {
            layers: [],
          },
        },
        timeSliderExtent: {
          start: new Date('2025-01-01T00:00:00.000Z'),
          end: new Date('2025-12-31T00:00:00.000Z'),
        } as TimeExtent,
        url: '',
        isNoticeMarkedAsRead: false,
        mapId: '',
        layers: [],
        [immerable]: true,
      },
    });

    const timeExtent = {
      start: new Date('2025-02-01T00:00:00.000Z'),
      end: new Date('2025-11-30T00:00:00.000Z'),
    } as TimeExtent;

    activeMapItem.set(item);
    fixture.detectChanges();

    component.onTimeSliderExtentChange(timeExtent);

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining('Set Time Slider Extent'),
        timeExtent,
        activeMapItem: item,
      }),
    );
  });
});
