import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {selectMapAttributeFiltersItem} from '../../../state/map/selectors/map-attribute-filters-item.selector';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {MapAttributeFilterComponent} from './map-attribute-filter.component';
import {ActiveMapItemActions} from '../../../state/map/actions/active-map-item.actions';
import {MapAttributeFiltersItemActions} from '../../../state/map/actions/map-attribute-filters-item.actions';
import {immerable} from 'immer';
import {Gb2WmsActiveMapItem} from '../../models/implementations/gb2-wms.model';

describe('MapAttributeFilterComponent', () => {
  let component: MapAttributeFilterComponent;
  let fixture: ComponentFixture<MapAttributeFilterComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  const mapAttributeFiltersItem: Gb2WmsActiveMapItem = {
    id: 'item-1',
    settings: {
      type: 'gb2Wms',
      url: '',
      isNoticeMarkedAsRead: true,
      mapId: 'yes',
      layers: [],
      [immerable]: true,
      filterConfigurations: [
        {
          name: 'Filter 1',
          parameter: 'parameter-1',
          description: 'Filter description',
          filterValues: [
            {
              name: 'Value 1',
              isActive: false,
              values: [],
            },
            {
              name: 'Value 2',
              isActive: true,
              values: [],
            },
          ],
        },
      ],
    },
    title: '',
    mapImageUrl: '',
    isSingleLayer: false,
    geometadataUuid: null,
    visible: false,
    opacity: 0,
    loadingState: undefined,
    viewProcessState: undefined,
    isTemporary: false,
    addToMap: vi.fn(),
    [immerable]: true,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapAttributeFilterComponent],
      providers: [provideMockStore()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectMapAttributeFiltersItem, undefined);
    store.overrideSelector(selectScreenMode, 'regular');
    store.refreshState();
    storeDispatchSpy = vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(MapAttributeFilterComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clear the filter item when no filter item is selected', () => {
    expect(storeDispatchSpy).toHaveBeenCalledWith(MapAttributeFiltersItemActions.clearMapAttributeFiltersItemId());
  });

  it('should dispatch clearMapAttributeFiltersItemId when clearMapAttributeFiltersItemId is called', () => {
    storeDispatchSpy.mockClear();

    component.clearMapAttributeFiltersItemId();

    expect(storeDispatchSpy).toHaveBeenCalledOnce();
    expect(storeDispatchSpy).toHaveBeenCalledWith(MapAttributeFiltersItemActions.clearMapAttributeFiltersItemId());
  });

  it('should not dispatch an attribute filter action when no filter item is selected', () => {
    storeDispatchSpy.mockClear();

    component.updateFilter('parameter-1', 'Value 1', true);

    expect(storeDispatchSpy).not.toHaveBeenCalled();
  });

  it('should dispatch an attribute filter action when a filter item is selected', () => {
    store.overrideSelector(selectMapAttributeFiltersItem, mapAttributeFiltersItem);
    store.refreshState();
    fixture.detectChanges();
    storeDispatchSpy.mockClear();

    component.updateFilter('parameter-1', 'Value 1', true);

    expect(storeDispatchSpy).toHaveBeenCalledOnce();
    expect(storeDispatchSpy).toHaveBeenCalledWith(
      ActiveMapItemActions.setAttributeFilterValueState({
        isFilterValueActive: false,
        filterValueName: 'Value 1',
        attributeFilterParameter: 'parameter-1',
        activeMapItem: mapAttributeFiltersItem,
      }),
    );
  });

  it('should activate the filter value when its checkbox is unchecked', () => {
    store.overrideSelector(selectMapAttributeFiltersItem, mapAttributeFiltersItem);
    store.refreshState();
    fixture.detectChanges();
    storeDispatchSpy.mockClear();

    component.updateFilter('parameter-1', 'Value 1', false);

    expect(storeDispatchSpy).toHaveBeenCalledWith(
      ActiveMapItemActions.setAttributeFilterValueState({
        isFilterValueActive: true,
        filterValueName: 'Value 1',
        attributeFilterParameter: 'parameter-1',
        activeMapItem: mapAttributeFiltersItem,
      }),
    );
  });

  it('should render the filter configuration name', () => {
    store.overrideSelector(selectMapAttributeFiltersItem, mapAttributeFiltersItem);
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Filter 1');
  });

  it('should render the filter configuration description', () => {
    store.overrideSelector(selectMapAttributeFiltersItem, mapAttributeFiltersItem);
    store.refreshState();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Filter description');
  });

  it('should render all filter values', () => {
    store.overrideSelector(selectMapAttributeFiltersItem, mapAttributeFiltersItem);
    store.refreshState();
    fixture.detectChanges();

    const checkboxes = compiled.querySelectorAll('mat-checkbox');

    expect(checkboxes).toHaveLength(2);
    expect(compiled.textContent).toContain('Value 1');
    expect(compiled.textContent).toContain('Value 2');
  });

  it('should not render a description when the filter configuration has no description', () => {
    const itemWithoutDescription: Gb2WmsActiveMapItem = {
      ...mapAttributeFiltersItem,
      settings: {
        ...mapAttributeFiltersItem.settings,
        filterConfigurations: [
          {
            ...mapAttributeFiltersItem.settings.filterConfigurations![0],
            description: undefined,
          },
        ],
      },
      addToMap: vi.fn(),
    };

    store.overrideSelector(selectMapAttributeFiltersItem, itemWithoutDescription);
    store.refreshState();
    fixture.detectChanges();

    const description = compiled.querySelector('.attribute-filter__content__text');

    expect(description).toBeNull();
  });

  it('should render nothing when no filter item is selected', () => {
    expect(compiled.querySelector('.attribute-filter')).toBeNull();
  });

  it('should add the mobile class in mobile screen mode', () => {
    store.overrideSelector(selectMapAttributeFiltersItem, mapAttributeFiltersItem);
    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();
    fixture.detectChanges();

    const card = compiled.querySelector('.attribute-filter');

    expect(card).not.toBeNull();
    expect(card!.classList).toContain('attribute-filter--mobile');
    expect(compiled.querySelector('.attribute-filter__content--mobile')).not.toBeNull();
  });

  it('should not add the mobile classes in regular screen mode', () => {
    store.overrideSelector(selectMapAttributeFiltersItem, mapAttributeFiltersItem);
    store.overrideSelector(selectScreenMode, 'regular');
    store.refreshState();
    fixture.detectChanges();

    const card = compiled.querySelector('.attribute-filter');

    expect(card).not.toBeNull();
    expect(card!.classList).not.toContain('attribute-filter--mobile');
    expect(compiled.querySelector('.attribute-filter__content--mobile')).toBeNull();
  });

  it('should call updateFilter when a checkbox changes', () => {
    store.overrideSelector(selectMapAttributeFiltersItem, mapAttributeFiltersItem);
    store.refreshState();
    fixture.detectChanges();

    const updateFilterSpy = vi.spyOn(component, 'updateFilter');
    const checkbox = compiled.querySelector('mat-checkbox');

    expect(checkbox).not.toBeNull();

    checkbox!.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(updateFilterSpy).toHaveBeenCalled();
  });

  it('should reflect the active state inversely in the checkbox checked state', () => {
    store.overrideSelector(selectMapAttributeFiltersItem, mapAttributeFiltersItem);
    store.refreshState();
    fixture.detectChanges();

    const checkboxes = compiled.querySelectorAll('mat-checkbox');

    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0].getAttribute('ng-reflect-checked')).not.toBe('false');
  });

  it('should apply the unchecked class to active filter values', () => {
    store.overrideSelector(selectMapAttributeFiltersItem, mapAttributeFiltersItem);
    store.refreshState();
    fixture.detectChanges();

    const checkboxes = compiled.querySelectorAll('.attribute-filter__content__checkbox');

    expect(checkboxes[0].classList).not.toContain('attribute-filter__content__checkbox--unchecked');
    expect(checkboxes[1].classList).toContain('attribute-filter__content__checkbox--unchecked');
  });
});
