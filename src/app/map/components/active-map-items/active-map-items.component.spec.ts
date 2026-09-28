import {CdkDrag, CdkDragDrop} from '@angular/cdk/drag-drop';
import {Component, Directive, input} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {OnboardingGuideService} from '../../../onboarding-guide/services/onboarding-guide.service';
import {TypedTourAnchorDirective} from '../../../shared/directives/typed-tour-anchor.directive';
import {selectScreenMode} from '../../../state/app/reducers/app-layout.reducer';
import {selectIsAuthenticated} from '../../../state/auth/reducers/auth-status.reducer';
import {ActiveMapItemActions} from '../../../state/map/actions/active-map-item.actions';
import {MapUiActions} from '../../../state/map/actions/map-ui.actions';
import {selectActiveTool} from '../../../state/map/reducers/tool.reducer';
import {selectItems} from '../../../state/map/selectors/active-map-items.selector';
import {ActiveMapItem} from '../../models/active-map-item.model';
import {Gb2WmsActiveMapItem} from '../../models/implementations/gb2-wms.model';
import {NotificationIndicatorComponent} from '../notification-indicator/notification-indicator.component';
import {ActiveMapItemComponent} from './active-map-item/active-map-item.component';
import {ActiveMapItemsComponent} from './active-map-items.component';

@Directive({selector: '[typedTourAnchor]'})
class TypedTourAnchorStubDirective {
  public readonly typedTourAnchor = input<string>();
}

@Component({selector: 'notification-indicator', template: ''})
class NotificationIndicatorStubComponent {}

@Component({selector: 'active-map-item', template: '<ng-content />'})
class ActiveMapItemStubComponent {
  public readonly activeMapItem = input.required<ActiveMapItem>();
  public readonly isFirstActiveMapItem = input(false);
  public readonly isLastActiveMapItem = input(false);
  public readonly isDragAndDropDisabled = input(false);
}

describe('ActiveMapItemsComponent', () => {
  let fixture: ComponentFixture<ActiveMapItemsComponent>;
  let component: ActiveMapItemsComponent;
  let compiled: HTMLElement;
  let store: MockStore;

  const onboardingGuideService = {start: vi.fn()};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveMapItemsComponent],
      providers: [{provide: OnboardingGuideService, useValue: onboardingGuideService}, provideMockStore(), provideNoopAnimations()],
    })
      .overrideComponent(ActiveMapItemsComponent, {
        remove: {imports: [TypedTourAnchorDirective, NotificationIndicatorComponent, ActiveMapItemComponent]},
        add: {imports: [TypedTourAnchorStubDirective, NotificationIndicatorStubComponent, ActiveMapItemStubComponent]},
      })
      .compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectIsAuthenticated, false);
    store.overrideSelector(selectItems, []);
    store.overrideSelector(selectScreenMode, 'regular');
    store.overrideSelector(selectActiveTool, undefined);
    store.refreshState();

    fixture = TestBed.createComponent(ActiveMapItemsComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  function setItems(items: ActiveMapItem[]): void {
    store.overrideSelector(selectItems, items);
    store.refreshState();
    fixture.detectChanges();
  }

  function mapItem(id = 'map-1'): ActiveMapItem {
    return {id} as ActiveMapItem;
  }

  function gb2Item(notice: string | undefined, isNoticeMarkedAsRead: boolean): Gb2WmsActiveMapItem {
    return Object.assign(Object.create(Gb2WmsActiveMapItem.prototype), {
      id: 'gb2-map',
      settings: {notice, isNoticeMarkedAsRead},
    }) as Gb2WmsActiveMapItem;
  }

  it('explains why saving a favourite is unavailable', () => {
    expect(component.toolTipsFavourite()).toBe(component.favouriteHelperMessages.notAuthenticated);

    store.overrideSelector(selectIsAuthenticated, true);
    store.refreshState();
    expect(component.toolTipsFavourite()).toBe(component.favouriteHelperMessages.noMapsAdded);

    setItems([mapItem()]);
    expect(component.toolTipsFavourite()).toBe(component.favouriteHelperMessages.authenticatedAndMapsAdded);
  });

  it('enables favourite creation only for authenticated users with active maps', () => {
    const favouriteButton = () => compiled.querySelector<HTMLButtonElement>(`span[aria-label="${component.toolTipsFavourite()}"] button`)!;

    expect(favouriteButton().disabled).toBe(true);

    store.overrideSelector(selectIsAuthenticated, true);
    setItems([mapItem()]);

    expect(favouriteButton().disabled).toBe(false);
  });

  it('counts only GB2 notices and distinguishes unread notices', () => {
    setItems([gb2Item('Read', true), gb2Item('Unread', false), gb2Item(undefined, false), mapItem('other')]);

    expect(component.numberOfNotices()).toBe(2);
    expect(component.numberOfUnreadNotices()).toBe(1);
    expect(compiled.querySelector('notification-indicator')).not.toBeNull();

    setItems([gb2Item('Read', true)]);

    expect(component.numberOfUnreadNotices()).toBe(0);
    expect(compiled.querySelector('notification-indicator')).toBeNull();
  });

  it('disables reordering while another map tool is active', () => {
    setItems([mapItem()]);
    expect(component.isActiveMapItemDragAndDropDisabled()).toBe(false);

    store.overrideSelector(selectActiveTool, 'drawing' as never);
    store.refreshState();
    fixture.detectChanges();

    expect(component.isActiveMapItemDragAndDropDisabled()).toBe(true);
    expect(
      compiled
        .querySelector('.active-map-items__content__item__drag-handle')
        ?.classList.contains('active-map-items__content__item__drag-handle--disabled'),
    ).toBe(true);
  });

  it('dispatches reorder and toolbar actions', () => {
    const dispatch = vi.spyOn(store, 'dispatch');

    component.dropMapItem({previousIndex: 2, currentIndex: 0} as CdkDragDrop<CdkDrag>);
    component.removeAllActiveMapItems();
    component.showFavouriteDialog();
    component.showMapNotices();

    expect(dispatch).toHaveBeenCalledWith(ActiveMapItemActions.reorderActiveMapItem({previousPosition: 2, currentPosition: 0}));
    expect(dispatch).toHaveBeenCalledWith(ActiveMapItemActions.removeAllActiveMapItems());
    expect(dispatch).toHaveBeenCalledWith(MapUiActions.showCreateFavouriteDialog());
    expect(dispatch).toHaveBeenCalledWith(MapUiActions.showMapNoticesDialog());
  });

  it('restarts onboarding through the guide service', () => {
    compiled.querySelector<HTMLButtonElement>(`button[aria-label="${component.tooltipText.onboardingGuide}"]`)!.click();

    expect(onboardingGuideService.start).toHaveBeenCalledOnce();
  });

  it('adapts the header and content to screen and minimized state', () => {
    setItems([mapItem()]);
    expect(compiled.querySelector('.active-map-items__header')).not.toBeNull();
    expect(compiled.querySelector('.active-map-items__content--hidden')).toBeNull();

    component.isMinimized.set(true);
    fixture.detectChanges();
    expect(compiled.querySelector('.active-map-items__content--hidden')).not.toBeNull();

    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();
    fixture.detectChanges();
    expect(compiled.querySelector('.active-map-items__header')).toBeNull();
    expect(compiled.querySelector('.active-map-items')?.classList.contains('active-map-items--hide-shadow')).toBe(true);
  });

  it('tracks map items by their stable id', () => {
    expect(component.trackByMapItemId(3, mapItem('stable-id'))).toBe('stable-id');
  });
});
