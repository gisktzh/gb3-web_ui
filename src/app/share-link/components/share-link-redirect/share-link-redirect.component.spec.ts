import {TestBed} from '@angular/core/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {ShareLinkParameterInvalid} from '../../../shared/errors/share-link.errors';
import {RouteParamConstants} from '../../../shared/constants/route-param.constants';
import {SessionStorageService} from '../../../shared/services/session-storage.service';
import {ShareLinkRedirectComponent} from './share-link-redirect.component';

describe('ShareLinkRedirectComponent', () => {
  const router = {navigate: vi.fn()};
  const sessionStorageService = {set: vi.fn()};

  async function configure(id: string | null) {
    await TestBed.configureTestingModule({
      imports: [ShareLinkRedirectComponent],
      providers: [
        {provide: ActivatedRoute, useValue: {snapshot: {paramMap: {get: () => id}}}},
        {provide: Router, useValue: router},
        {provide: SessionStorageService, useValue: sessionStorageService},
      ],
    }).compileComponents();
  }

  it('stores the route id for the map page and redirects to the map', async () => {
    await configure('share-42');
    TestBed.createComponent(ShareLinkRedirectComponent);
    expect(sessionStorageService.set).toHaveBeenCalledWith(RouteParamConstants.SHARE_LINK_ID_SESSION_STORAGE_KEY, 'share-42');
    expect(router.navigate).toHaveBeenCalledWith([MainPage.Maps], {replaceUrl: true});
  });

  it('rejects a route without a share id', async () => {
    await configure(null);
    expect(() => TestBed.createComponent(ShareLinkRedirectComponent)).toThrow(ShareLinkParameterInvalid);
    expect(sessionStorageService.set).not.toHaveBeenCalled();
  });
});
