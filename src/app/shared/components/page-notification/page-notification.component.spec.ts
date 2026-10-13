import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {PageNotification} from '../../interfaces/page-notification.interface';
import {PageNotificationComponent} from './page-notification.component';
import {MAT_SNACK_BAR_DATA} from '@angular/material/snack-bar';
import {PageNotificationActions} from 'src/app/state/app/actions/page-notification.actions';

describe('PageNotificationComponent', () => {
  let component: PageNotificationComponent;
  let fixture: ComponentFixture<PageNotificationComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  const dataMock: PageNotification = {
    id: 'notification-id',
    title: 'Test title',
    description: 'Test description',
    severity: 'info',
    pages: [],
    fromDate: new Date(),
    toDate: new Date(),
    isMarkedAsRead: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageNotificationComponent],
      providers: [{provide: MAT_SNACK_BAR_DATA, useValue: dataMock}, provideMockStore()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectScreenMode, 'regular');
    store.refreshState();
    storeDispatchSpy = vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(PageNotificationComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the injected notification data', () => {
    expect(component.data).toEqual(dataMock);
  });

  describe('icon', () => {
    it('should use info icon for info notifications', () => {
      expect(component.icon).toBe('ktzh_info_notification');
    });

    it('should use warning icon for warning notifications', () => {
      TestBed.resetTestingModule();

      const warningData: PageNotification = {
        ...dataMock,
        severity: 'warning',
      };

      TestBed.configureTestingModule({
        imports: [PageNotificationComponent],
        providers: [
          {
            provide: MAT_SNACK_BAR_DATA,
            useValue: warningData,
          },
          provideMockStore(),
        ],
      });

      const warningFixture = TestBed.createComponent(PageNotificationComponent);
      const warningComponent = warningFixture.componentInstance;

      expect(warningComponent.icon).toBe('ktzh_caution');
    });
  });

  describe('template rendering', () => {
    it('should render notification title and description', () => {
      expect(compiled.querySelector('.page-notification-label__text-container__title')?.textContent).toContain(dataMock.title);

      expect(compiled.querySelector('.page-notification-label__text-container__text')?.textContent).toContain(dataMock.description);
    });

    it('should apply info classes for info severity', () => {
      expect(compiled.querySelector('.page-notification-label')?.classList).toContain('page-notification-label--info');

      expect(compiled.querySelector('.page-notification-actions')?.classList).toContain('page-notification-actions--info');
    });

    it('should apply warning classes for warning severity', () => {
      TestBed.resetTestingModule();

      const warningData: PageNotification = {
        ...dataMock,
        severity: 'warning',
      };

      TestBed.configureTestingModule({
        imports: [PageNotificationComponent],
        providers: [
          {
            provide: MAT_SNACK_BAR_DATA,
            useValue: warningData,
          },
          provideMockStore(),
        ],
      });

      const warningFixture = TestBed.createComponent(PageNotificationComponent);
      const warningCompiled = warningFixture.nativeElement as HTMLElement;
      warningFixture.detectChanges();

      expect(warningCompiled.querySelector('.page-notification-label')?.classList).toContain('page-notification-label--warning');
      expect(warningCompiled.querySelector('.page-notification-actions')?.classList).toContain('page-notification-actions--warning');
    });

    it('should use mobile class when screen mode is mobile', () => {
      store.overrideSelector(selectScreenMode, 'mobile');
      store.refreshState();
      fixture.detectChanges();

      expect(compiled.querySelector('.page-notification-label__text-container__text')?.classList).toContain(
        'page-notification-label__text-container__text--mobile',
      );
    });

    it('should not use mobile class when screen mode is regular', () => {
      expect(compiled.querySelector('.page-notification-label__text-container__text')?.classList).not.toContain(
        'page-notification-label__text-container__text--mobile',
      );
    });
  });

  describe('markPageNotificationAsRead', () => {
    it('should dispatch markPageNotificationAsRead action', () => {
      component.markPageNotificationAsRead();

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        PageNotificationActions.markPageNotificationAsRead({
          id: dataMock.id,
        }),
      );
    });

    it('should dispatch markPageNotificationAsRead when close button is clicked', () => {
      const closeButton = compiled.querySelector<HTMLButtonElement>('.page-notification-actions__close-button');

      closeButton?.click();

      expect(storeDispatchSpy).toHaveBeenCalledWith(
        PageNotificationActions.markPageNotificationAsRead({
          id: dataMock.id,
        }),
      );
    });
  });
});
