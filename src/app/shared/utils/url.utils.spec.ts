import {TestBed} from '@angular/core/testing';
import {UrlUtils} from './url.utils';
import {RouterTestingModule} from '@angular/router/testing';
import {Router} from '@angular/router';
import {MainPage} from '../enums/main-page.enum';

describe('UrlUtils', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
    });
  });

  it('should extract the correct URL segment', () => {
    const router = TestBed.inject(Router);
    expect(UrlUtils.extractFirstUrlSegmentPath(router.parseUrl(''))).toBe('');
    expect(UrlUtils.extractFirstUrlSegmentPath(router.parseUrl('?argument=value'))).toBe('');
    expect(UrlUtils.extractFirstUrlSegmentPath(router.parseUrl('/'))).toBe('');
    expect(UrlUtils.extractFirstUrlSegmentPath(router.parseUrl('/?argument=value'))).toBe('');
    expect(UrlUtils.extractFirstUrlSegmentPath(router.parseUrl('/first/second'))).toBe('first');
    expect(UrlUtils.extractFirstUrlSegmentPath(router.parseUrl('/first?argument=value'))).toBe('first');
    expect(UrlUtils.extractFirstUrlSegmentPath(router.parseUrl('first/second/third?argument=value'))).toBe('first');
    expect(UrlUtils.extractFirstUrlSegmentPath(router.parseUrl('//first/second/third?argument=value'))).toBe('first');

    expect(UrlUtils.extractFirstUrlSegmentPath(router.parseUrl('%ç*/*ç%&/&%//*ç%/'))).toBe('');
  });

  it('should transform an URL string into the correct MainPage enum (or undefined)', () => {
    for (const mainPageKey in MainPage) {
      const mainPage: MainPage = MainPage[mainPageKey as keyof typeof MainPage];
      expect(UrlUtils.transformStringToMainPage(mainPage)).toBe(mainPage);
    }

    expect(UrlUtils.transformStringToMainPage('notmainpage')).toBeUndefined();
    expect(UrlUtils.transformStringToMainPage(undefined)).toBeUndefined();
    expect(UrlUtils.transformStringToMainPage('maps x')).toBeUndefined();
    expect(UrlUtils.transformStringToMainPage(MainPage.Maps.toUpperCase())).toBeUndefined();
  });
});
