import {TestBed} from '@angular/core/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {ShareLinkParameterInvalid} from '../../../shared/errors/share-link.errors';
import {ShareLinkActions} from '../../../state/map/actions/share-link.actions';
import {selectApplicationInitializationLoadingState, selectLoadingState} from '../../../state/map/reducers/share-link.reducer';
import {ShareLinkRedirectComponent} from './share-link-redirect.component';

describe('ShareLinkRedirectComponent', () => {
  const router = {navigate: vi.fn()};

  async function configure(id: string | null) {
    await TestBed.configureTestingModule({
      imports: [ShareLinkRedirectComponent],
      providers: [
        provideMockStore(),
        {provide: ActivatedRoute, useValue: {snapshot: {paramMap: {get: () => id}}}},
        {provide: Router, useValue: router},
      ],
    }).compileComponents();
  }

  it('starts initialization for the route id and redirects once initialization finishes', async () => {
    await configure('share-42');
    const store = TestBed.inject(MockStore);
    store.overrideSelector(selectApplicationInitializationLoadingState, undefined);
    store.overrideSelector(selectLoadingState, undefined);
    store.refreshState();
    const dispatch = vi.spyOn(store, 'dispatch');
    const fixture = TestBed.createComponent(ShareLinkRedirectComponent);
    fixture.detectChanges();
    expect(dispatch).toHaveBeenCalledWith(ShareLinkActions.initializeApplicationBasedOnId({id: 'share-42'}));
    expect((fixture.nativeElement as HTMLElement).textContent).toContain("Prüfe Link 'share-42'");

    store.overrideSelector(selectApplicationInitializationLoadingState, 'loaded');
    store.refreshState();
    fixture.detectChanges();
    expect(router.navigate).toHaveBeenCalledWith([MainPage.Maps]);
  });

  it('rejects a route without a share id', async () => {
    await configure(null);
    expect(() => TestBed.createComponent(ShareLinkRedirectComponent)).toThrow(ShareLinkParameterInvalid);
  });
});
