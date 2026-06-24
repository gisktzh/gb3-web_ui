import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {selectApplicationInitializationLoadingState} from '../../../state/map/reducers/share-link.reducer';
import {selectLoadingState} from '../../../state/map/reducers/share-link.reducer';
import {ShareLinkRedirectComponent} from './share-link-redirect.component';
import {RouteParamConstants} from 'src/app/shared/constants/route-param.constants';
import {ShareLinkActions} from 'src/app/state/map/actions/share-link.actions';
import {MainPage} from 'src/app/shared/enums/main-page.enum';
import {ShareLinkParameterInvalid} from 'src/app/shared/errors/share-link.errors';

describe('ShareLinkRedirectComponent', () => {
  let component: ShareLinkRedirectComponent;
  let fixture: ComponentFixture<ShareLinkRedirectComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  const routerMock = {
    navigate: vi.fn(),
  };

  const activatedRouteMock = {
    snapshot: {
      paramMap: {
        get: vi.fn(() => 'test-id'),
      },
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareLinkRedirectComponent],
      providers: [provideMockStore(), {provide: ActivatedRoute, useValue: activatedRouteMock}, {provide: Router, useValue: routerMock}],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectApplicationInitializationLoadingState, undefined);
    store.overrideSelector(selectLoadingState, undefined);
    store.refreshState();
    storeDispatchSpy = vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(ShareLinkRedirectComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize application based on route id', () => {
    expect(storeDispatchSpy).toHaveBeenCalledWith(ShareLinkActions.initializeApplicationBasedOnId({id: 'test-id'}));
  });

  it('should render waiting text with id', () => {
    expect(compiled.textContent).toContain("Prüfe Link 'test-id'");
  });

  it('should navigate to maps when application initialization state is loaded', () => {
    store.overrideSelector(selectApplicationInitializationLoadingState, 'loaded');
    store.refreshState();
    fixture.detectChanges();

    expect(routerMock.navigate).toHaveBeenCalledWith([MainPage.Maps]);
  });

  it('should navigate to maps when application initialization state is error', () => {
    store.overrideSelector(selectApplicationInitializationLoadingState, 'error');
    store.refreshState();
    fixture.detectChanges();

    expect(routerMock.navigate).toHaveBeenCalledWith([MainPage.Maps]);
  });

  it('should navigate to maps when share link loading state is error', () => {
    store.overrideSelector(selectLoadingState, 'error');
    store.refreshState();
    fixture.detectChanges();

    expect(routerMock.navigate).toHaveBeenCalledWith([MainPage.Maps]);
  });

  it('should read the correct route parameter', () => {
    expect(activatedRouteMock.snapshot.paramMap.get).toHaveBeenCalledWith(RouteParamConstants.RESOURCE_IDENTIFIER);
  });
});

describe('ShareLinkRedirectComponent with invalid id', () => {
  const routerMock = {
    navigate: vi.fn(),
  };

  const activatedRouteMock = {
    snapshot: {
      paramMap: {
        get: vi.fn(() => null),
      },
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareLinkRedirectComponent],
      providers: [provideMockStore(), {provide: ActivatedRoute, useValue: activatedRouteMock}, {provide: Router, useValue: routerMock}],
    }).compileComponents();
  });

  it('should throw when share link id is missing', () => {
    expect(() => {
      TestBed.createComponent(ShareLinkRedirectComponent);
    }).toThrow(ShareLinkParameterInvalid);
  });
});
