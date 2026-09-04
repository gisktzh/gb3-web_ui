import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {selectIsAuthenticated} from '../../../state/auth/reducers/auth-status.reducer';
import {selectItems} from '../../../state/map/selectors/active-map-items.selector';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {selectActiveTool} from '../../../state/map/reducers/tool.reducer';
import {OnboardingGuideService} from '../../../onboarding-guide/services/onboarding-guide.service';
import {ActiveMapItemsComponent} from './active-map-items.component';
import {ActiveMapItemActions} from '../../../state/map/actions/active-map-item.actions';
import {MapUiActions} from '../../../state/map/actions/map-ui.actions';
import {Gb2WmsActiveMapItem} from '../../models/implementations/gb2-wms.model';
import {CdkDrag, CdkDragDrop} from '@angular/cdk/drag-drop';
import {ActiveMapItem} from '../../models/active-map-item.model';
import {provideUiTour} from 'ngx-ui-tour-md-menu';

describe('ActiveMapItemsComponent', () => {
  let component: ActiveMapItemsComponent;
  let fixture: ComponentFixture<ActiveMapItemsComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  const onboardingGuideServiceMock: Partial<OnboardingGuideService> = {
    start: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveMapItemsComponent],
      providers: [{provide: OnboardingGuideService, useValue: onboardingGuideServiceMock}, provideMockStore(), provideUiTour()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectIsAuthenticated, false);
    store.overrideSelector(selectItems, []);
    store.overrideSelector(selectScreenMode, 'regular');
    store.overrideSelector(selectActiveTool, undefined);
    store.refreshState();
    storeDispatchSpy = vi.spyOn(store, 'dispatch');

    fixture = TestBed.createComponent(ActiveMapItemsComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('toolTipsFavourite', () => {
    it('should return the not-authenticated message when the user is not authenticated', () => {
      store.overrideSelector(selectIsAuthenticated, false);
      store.overrideSelector(selectItems, []);
      store.refreshState();

      expect(component.toolTipsFavourite()).toBe(component.favouriteHelperMessages.notAuthenticated);
    });

    it('should return the no-maps message when authenticated without active maps', () => {
      store.overrideSelector(selectIsAuthenticated, true);
      store.overrideSelector(selectItems, []);
      store.refreshState();

      expect(component.toolTipsFavourite()).toBe(component.favouriteHelperMessages.noMapsAdded);
    });

    it('should return the save-favourite message when authenticated with active maps', () => {
      const activeMapItem = {id: 'map-1'} as ActiveMapItem;

      store.overrideSelector(selectIsAuthenticated, true);
      store.overrideSelector(selectItems, [activeMapItem]);
      store.refreshState();

      expect(component.toolTipsFavourite()).toBe(component.favouriteHelperMessages.authenticatedAndMapsAdded);
    });
  });

  describe('isActiveMapItemDragAndDropDisabled', () => {
    it('should be false when no tool is active', () => {
      store.overrideSelector(selectActiveTool, undefined);
      store.refreshState();

      expect(component.isActiveMapItemDragAndDropDisabled()).toBe(false);
    });

    it('should be true when a tool is active', () => {
      store.overrideSelector(selectActiveTool, 'some-tool' as never);
      store.refreshState();

      expect(component.isActiveMapItemDragAndDropDisabled()).toBe(true);
    });
  });

  describe('activeMapItemsWithNotices', () => {
    it('should count active GB2 WMS map items with notices', () => {
      const itemWithNotice = Object.assign(Object.create(Gb2WmsActiveMapItem.prototype), {
        id: 'map-1',
        settings: {
          notice: 'A notice',
          isNoticeMarkedAsRead: false,
        },
      }) as Gb2WmsActiveMapItem;

      const itemWithoutNotice = Object.assign(Object.create(Gb2WmsActiveMapItem.prototype), {
        id: 'map-2',
        settings: {
          notice: undefined,
          isNoticeMarkedAsRead: false,
        },
      }) as Gb2WmsActiveMapItem;

      store.overrideSelector(selectItems, [itemWithNotice, itemWithoutNotice]);
      store.refreshState();

      expect(component.gb2ActiveMapItems()).toHaveLength(2);
      expect(component.activeMapItemsWithNotices()).toEqual([itemWithNotice]);
      expect(component.numberOfNotices()).toBe(1);
      expect(component.numberOfUnreadNotices()).toBe(1);
    });

    it('should not count read notices as unread', () => {
      const itemWithReadNotice = Object.assign(Object.create(Gb2WmsActiveMapItem.prototype), {
        id: 'map-1',
        settings: {
          notice: 'A notice',
          isNoticeMarkedAsRead: true,
        },
      }) as Gb2WmsActiveMapItem;

      store.overrideSelector(selectItems, [itemWithReadNotice]);
      store.refreshState();

      expect(component.numberOfNotices()).toBe(1);
      expect(component.numberOfUnreadNotices()).toBe(0);
    });
  });

  describe('trackByMapItemId', () => {
    it('should return the map item id', () => {
      const item = {id: 'map-123'} as ActiveMapItem;

      expect(component.trackByMapItemId(0, item)).toBe('map-123');
    });
  });

  describe('dropMapItem', () => {
    it('should dispatch the reorder action', () => {
      const event = {
        previousIndex: 3,
        currentIndex: 1,
      } as CdkDragDrop<CdkDrag>;

      component.dropMapItem(event);

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        ActiveMapItemActions.reorderActiveMapItem({
          previousPosition: 3,
          currentPosition: 1,
        }),
      );
    });
  });

  describe('removeAllActiveMapItems', () => {
    it('should dispatch the remove-all action', () => {
      component.removeAllActiveMapItems();

      expect(storeDispatchSpy).toHaveBeenCalledWith(ActiveMapItemActions.removeAllActiveMapItems());
    });
  });

  describe('showFavouriteDialog', () => {
    it('should dispatch the create-favourite-dialog action', () => {
      component.showFavouriteDialog();

      expect(storeDispatchSpy).toHaveBeenCalledWith(MapUiActions.showCreateFavouriteDialog());
    });
  });

  describe('showMapNotices', () => {
    it('should dispatch the map-notices-dialog action', () => {
      component.showMapNotices();

      expect(storeDispatchSpy).toHaveBeenCalledWith(MapUiActions.showMapNoticesDialog());
    });
  });

  describe('restartOnboardingGuide', () => {
    it('should start the onboarding guide', () => {
      component.restartOnboardingGuide();

      expect(onboardingGuideServiceMock.start).toHaveBeenCalledOnce();
    });
  });

  describe('template', () => {
    it('should hide the shadow on mobile', () => {
      store.overrideSelector(selectScreenMode, 'mobile');
      store.refreshState();
      fixture.detectChanges();

      expect(compiled.querySelector('.active-map-items')?.classList).toContain('active-map-items--hide-shadow');
    });

    it('should display the header on regular screens', () => {
      store.overrideSelector(selectScreenMode, 'regular');
      store.refreshState();
      fixture.detectChanges();

      expect(compiled.querySelector('.active-map-items__header')).toBeTruthy();
    });

    it('should hide the header on mobile screens', () => {
      store.overrideSelector(selectScreenMode, 'mobile');
      store.refreshState();
      fixture.detectChanges();

      expect(compiled.querySelector('.active-map-items__header')).toBeNull();
    });

    it('should hide the active map items content when there are no active map items', () => {
      store.overrideSelector(selectItems, []);
      store.refreshState();
      fixture.detectChanges();

      expect(compiled.querySelector('.active-map-items__content')?.classList).toContain('active-map-items__content--hidden');
    });

    it('should show the active map items content when active map items exist', () => {
      const activeMapItem = {id: 'map-1'} as ActiveMapItem;

      store.overrideSelector(selectItems, [activeMapItem]);
      store.refreshState();
      fixture.detectChanges();

      expect(compiled.querySelector('.active-map-items__content')?.classList).not.toContain('active-map-items__content--hidden');
    });

    it('should disable the remove-all button when there are no active map items', () => {
      store.overrideSelector(selectItems, []);
      store.refreshState();
      fixture.detectChanges();

      const button = compiled.querySelector<HTMLButtonElement>(
        '.active-map-items__header__buttons__action:not(.active-map-items__header__buttons__action--notices)',
      );

      expect(button?.disabled).toBe(true);
    });

    it('should disable the favourite button when the user is not authenticated', () => {
      store.overrideSelector(selectIsAuthenticated, false);
      store.overrideSelector(selectItems, [{id: 'map-1'} as ActiveMapItem]);
      store.refreshState();
      fixture.detectChanges();

      const buttons = compiled.querySelectorAll<HTMLButtonElement>('.active-map-items__header__buttons__action');
      const favouriteButton = buttons[2];

      expect(favouriteButton.disabled).toBe(true);
    });

    it('should enable the favourite button when authenticated and active maps exist', () => {
      store.overrideSelector(selectIsAuthenticated, true);
      store.overrideSelector(selectItems, [{id: 'map-1'} as ActiveMapItem]);
      store.refreshState();
      fixture.detectChanges();

      const buttons = compiled.querySelectorAll<HTMLButtonElement>('.active-map-items__header__buttons__action');
      const favouriteButton = buttons[2];

      expect(favouriteButton.disabled).toBe(false);
    });

    it('should disable the notices button when there are no notices', () => {
      store.overrideSelector(selectItems, []);
      store.refreshState();
      fixture.detectChanges();

      const noticesButton = compiled.querySelector<HTMLButtonElement>('.active-map-items__header__buttons__action--notices');

      expect(noticesButton?.disabled).toBe(true);
    });

    it('should display the notification indicator when there are unread notices', () => {
      const itemWithNotice = Object.assign(Object.create(Gb2WmsActiveMapItem.prototype), {
        id: 'map-1',
        settings: {
          notice: 'A notice',
          isNoticeMarkedAsRead: false,
          type: 'gb2Wms',
          layers: [],
        },
      }) as Gb2WmsActiveMapItem;

      store.overrideSelector(selectItems, [itemWithNotice]);
      store.refreshState();
      fixture.detectChanges();

      expect(compiled.querySelector('notification-indicator')).toBeTruthy();
    });

    it('should not display the notification indicator when all notices are read', () => {
      const itemWithReadNotice = Object.assign(Object.create(Gb2WmsActiveMapItem.prototype), {
        id: 'map-1',
        settings: {
          notice: 'A notice',
          isNoticeMarkedAsRead: true,
          type: 'gb2Wms',
          layers: [],
        },
      }) as Gb2WmsActiveMapItem;

      store.overrideSelector(selectItems, [itemWithReadNotice]);
      store.refreshState();
      fixture.detectChanges();

      expect(compiled.querySelector('notification-indicator')).toBeNull();
    });

    it('should apply the disabled drag-and-drop state when a tool is active', () => {
      store.overrideSelector(selectActiveTool, 'some-tool' as never);
      store.overrideSelector(selectItems, [{id: 'map-1'} as ActiveMapItem]);
      store.refreshState();
      fixture.detectChanges();

      const dragHandle = compiled.querySelector('.active-map-items__content__item__drag-handle');

      expect(dragHandle?.classList).toContain('active-map-items__content__item__drag-handle--disabled');
    });

    it('should apply the mobile class to active map items on mobile', () => {
      store.overrideSelector(selectScreenMode, 'mobile');
      store.overrideSelector(selectItems, [{id: 'map-1'} as ActiveMapItem]);
      store.refreshState();
      fixture.detectChanges();

      const item = compiled.querySelector('.active-map-items__content__item');

      expect(item?.classList).toContain('active-map-items__content__item--mobile');
    });
  });
});
