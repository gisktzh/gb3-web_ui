import {Component, input, output} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Map} from 'src/app/shared/interfaces/topic.interface';
import {selectIsAuthenticated} from 'src/app/state/auth/reducers/auth-status.reducer';
import {ActiveMapItemActions} from 'src/app/state/map/actions/active-map-item.actions';
import {LayerCatalogActions} from 'src/app/state/map/actions/layer-catalog.actions';
import {MapUiActions} from 'src/app/state/map/actions/map-ui.actions';
import {selectFilterString} from 'src/app/state/map/reducers/layer-catalog.reducer';
import {selectItems} from 'src/app/state/map/selectors/active-map-items.selector';
import {Gb2WmsActiveMapItem} from '../../models/implementations/gb2-wms.model';
import {ActiveMapItemsComponent} from '../active-map-items/active-map-items.component';
import {MapDataCatalogueComponent} from '../map-data-catalogue/map-data-catalogue.component';
import {NotificationIndicatorComponent} from '../notification-indicator/notification-indicator.component';
import {SearchInputComponent} from '../../../shared/components/search/search-input.component';
import {MapManagementMobileComponent} from './map-management-mobile.component';

@Component({selector: 'search-input', template: ''})
class SearchInputStubComponent {
  public readonly mode = input<string>();
  public readonly showFilterButton = input<boolean>();
  public readonly alwaysEnableClearButton = input<boolean>();
  public readonly placeholderText = input<string>();
  public readonly focusEvent = output<void>();
  public readonly changeSearchTermEvent = output<string>();
  public readonly clearSearchTermEvent = output<void>();
}

@Component({selector: 'active-map-items', template: ''})
class ActiveMapItemsStubComponent {}

@Component({selector: 'map-data-catalogue', template: ''})
class MapDataCatalogueStubComponent {}

@Component({selector: 'notification-indicator', template: ''})
class NotificationIndicatorStubComponent {}

describe('MapManagementMobileComponent', () => {
  let fixture: ComponentFixture<MapManagementMobileComponent>;
  let component: MapManagementMobileComponent;
  let store: MockStore;

  const map: Map = {
    id: 'map-1',
    title: 'Map',
    layers: [],
    icon: '',
    gb2Url: null,
    uuid: 'uuid',
    printTitle: 'Map',
    organisation: 'Organisation',
    keywords: [],
    wmsUrl: 'https://example.test/wms',
    minScale: 0,
    notice: 'Read this notice',
    opacity: 1,
    timeSliderConfiguration: undefined,
    initialTimeSliderExtent: undefined,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapManagementMobileComponent],
      providers: [provideMockStore()],
    })
      .overrideComponent(MapManagementMobileComponent, {
        remove: {
          imports: [SearchInputComponent, ActiveMapItemsComponent, MapDataCatalogueComponent, NotificationIndicatorComponent],
        },
        add: {
          imports: [
            SearchInputStubComponent,
            ActiveMapItemsStubComponent,
            MapDataCatalogueStubComponent,
            NotificationIndicatorStubComponent,
          ],
        },
      })
      .compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectItems, []);
    store.overrideSelector(selectIsAuthenticated, false);
    store.overrideSelector(selectFilterString, undefined);
    store.refreshState();
    vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(MapManagementMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the catalogue and shows it as the initial tab', () => {
    expect(store.dispatch).toHaveBeenCalledWith(LayerCatalogActions.loadLayerCatalog());
    expect(component.activeTab()).toBe('mapsCatalogue');
    expect(fixture.nativeElement.querySelector('map-data-catalogue').classList).not.toContain('map-management-mobile-content--hidden');
    expect(fixture.nativeElement.querySelector('active-map-items').classList).toContain('map-management-mobile-content--hidden');
  });

  it('switches between catalogue and active maps through the rendered tab buttons', () => {
    const buttons = fixture.nativeElement.querySelectorAll(
      '.map-management-mobile-header__buttons__button',
    ) as NodeListOf<HTMLButtonElement>;

    buttons[0].click();
    fixture.detectChanges();

    expect(component.activeTab()).toBe('activeMaps');
    expect(fixture.nativeElement.querySelector('active-map-items').classList).not.toContain('map-management-mobile-content--hidden');
    expect(fixture.nativeElement.querySelector('map-data-catalogue').classList).toContain('map-management-mobile-content--hidden');
  });

  it('forwards search interactions to the catalogue filter actions', () => {
    const search = fixture.debugElement.query(By.directive(SearchInputStubComponent)).componentInstance as SearchInputStubComponent;

    search.focusEvent.emit();
    search.changeSearchTermEvent.emit('roads');
    search.clearSearchTermEvent.emit();

    expect(store.dispatch).toHaveBeenCalledWith(LayerCatalogActions.setFilterString({filterString: ''}));
    expect(store.dispatch).toHaveBeenCalledWith(LayerCatalogActions.setFilterString({filterString: 'roads'}));
    expect(store.dispatch).toHaveBeenCalledWith(LayerCatalogActions.clearFilterString());
  });

  it('hides the tabs while filtering and marks the content as filtering', () => {
    store.overrideSelector(selectFilterString, 'roads');
    store.refreshState();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.map-management-mobile-header__buttons')).toBeNull();
    expect(fixture.nativeElement.querySelector('.map-management-mobile-content').classList).toContain(
      'map-management-mobile-content--filtering',
    );
  });

  it('removes all active maps from the rendered action', () => {
    store.overrideSelector(selectItems, [new Gb2WmsActiveMapItem(map)]);
    store.refreshState();
    component.changeTabs('activeMaps');
    fixture.detectChanges();

    const deleteButton = fixture.nativeElement.querySelectorAll(
      '.map-management-mobile-header__tools__buttons__action',
    )[1] as HTMLButtonElement;
    deleteButton.click();

    expect(store.dispatch).toHaveBeenCalledWith(ActiveMapItemActions.removeAllActiveMapItems());
  });

  it('enables favourite creation only for authenticated users with active maps', () => {
    store.overrideSelector(selectItems, [new Gb2WmsActiveMapItem(map)]);
    store.overrideSelector(selectIsAuthenticated, true);
    store.refreshState();
    component.changeTabs('activeMaps');
    fixture.detectChanges();

    const favouriteButton = fixture.nativeElement.querySelectorAll(
      '.map-management-mobile-header__tools__buttons__action',
    )[2] as HTMLButtonElement;
    expect(favouriteButton.disabled).toBe(false);

    favouriteButton.click();
    expect(store.dispatch).toHaveBeenCalledWith(MapUiActions.showCreateFavouriteDialog());
  });

  it('shows unread map notices and opens the notices dialog', () => {
    store.overrideSelector(selectItems, [new Gb2WmsActiveMapItem(map)]);
    store.refreshState();
    component.changeTabs('activeMaps');
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(NotificationIndicatorStubComponent))).not.toBeNull();
    expect(component.numberOfNotices()).toBe(1);
    expect(component.numberOfUnreadNotices()).toBe(1);

    const noticeButton = fixture.nativeElement.querySelector(
      '.map-management-mobile-header__tools__buttons__action--notices',
    ) as HTMLButtonElement;
    noticeButton.click();
    expect(store.dispatch).toHaveBeenCalledWith(MapUiActions.showMapNoticesDialog());
  });

  it('clears the catalogue filter when destroyed', () => {
    fixture.destroy();

    expect(store.dispatch).toHaveBeenCalledWith(LayerCatalogActions.clearFilterString());
  });
});
