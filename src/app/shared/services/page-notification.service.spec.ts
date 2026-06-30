import {TestBed} from '@angular/core/testing';
import {PageNotificationService} from './page-notification.service';
import {PageNotificationActions} from '../../state/app/actions/page-notification.actions';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectMainPage} from 'src/app/state/app/reducers/url.reducer';
import {MainPage} from '../enums/main-page.enum';
import {selectAllUnreadPageNotifications} from 'src/app/state/app/selectors/page-notification.selector';
import {PageNotification} from '../interfaces/page-notification.interface';

describe('PageNotificationService', () => {
  let store: MockStore;

  const notifications: PageNotification[] = [
    {
      id: '1',
      pages: [MainPage.Start],
      title: '',
      description: '',
      fromDate: new Date(),
      toDate: new Date(),
      severity: 'info',
      isMarkedAsRead: false,
    },
    {
      id: '2',
      pages: [MainPage.Support],
      title: '',
      description: '',
      fromDate: new Date(),
      toDate: new Date(),
      severity: 'info',
      isMarkedAsRead: false,
    },
    {
      id: '3',
      pages: [MainPage.Start, MainPage.Support],
      title: '',
      description: '',
      fromDate: new Date(),
      toDate: new Date(),
      severity: 'info',
      isMarkedAsRead: false,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideMockStore({})],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectAllUnreadPageNotifications, notifications);
    store.overrideSelector(selectMainPage, MainPage.Maps);
    store.refreshState();
  });

  it('dispatches loadPageNotifications on construction', () => {
    TestBed.runInInjectionContext(() => {
      const storeDispatchSpy = vi.spyOn(store, 'dispatch');
      const service = TestBed.inject(PageNotificationService);

      expect(storeDispatchSpy).toHaveBeenCalledWith(PageNotificationActions.loadPageNotifications());
      expect(service).toBeDefined();
    });
  });

  it('filters notifications for current main page', () => {
    const service = TestBed.runInInjectionContext(() => TestBed.inject(PageNotificationService));

    const result = service.currentPageNotifications();

    expect(result).toEqual([]);
  });

  it('reactively updates when mainPage changes', async () => {
    vi.useFakeTimers();
    const service = TestBed.runInInjectionContext(() => TestBed.inject(PageNotificationService));

    expect(service.currentPageNotifications().length).toBe(0);

    store.overrideSelector(selectMainPage, MainPage.Support);
    store.refreshState();

    await vi.runAllTimersAsync();

    expect(service.currentPageNotifications()).toEqual([notifications[1], notifications[2]]);
  });
});
