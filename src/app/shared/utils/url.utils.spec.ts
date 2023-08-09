import {TestBed} from '@angular/core/testing';
import {UrlUtils} from './url.utils';
import {RouterTestingModule} from '@angular/router/testing';
import {Router, UrlSegment} from '@angular/router';
import {MainPage} from '../enums/main-page.enum';

function createSegmentsFromUrl(router: Router, url: string): UrlSegment[] {
  return UrlUtils.extractUrlSegments(router.parseUrl(url));
}

describe('UrlUtils', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
    });
  });

  it('should extract URL segments from a UrlTree', () => {
    const router = TestBed.inject(Router);
    expect(UrlUtils.extractUrlSegments(router.parseUrl(''))).toEqual([]);
    expect(UrlUtils.extractUrlSegments(router.parseUrl('?argument=value'))).toEqual([]);
    expect(UrlUtils.extractUrlSegments(router.parseUrl('/'))).toEqual([]);
    expect(UrlUtils.extractUrlSegments(router.parseUrl('/first/second'))).toEqual([
      new UrlSegment('first', {}),
      new UrlSegment('second', {}),
    ]);
  });

  it('should extract the correct URL segment', () => {
    const router = TestBed.inject(Router);
    expect(UrlUtils.extractFirstUrlSegmentPath(createSegmentsFromUrl(router, ''))).toBe('');
    expect(UrlUtils.extractFirstUrlSegmentPath(createSegmentsFromUrl(router, '?argument=value'))).toBe('');
    expect(UrlUtils.extractFirstUrlSegmentPath(createSegmentsFromUrl(router, '/'))).toBe('');
    expect(UrlUtils.extractFirstUrlSegmentPath(createSegmentsFromUrl(router, '/?argument=value'))).toBe('');
    expect(UrlUtils.extractFirstUrlSegmentPath(createSegmentsFromUrl(router, '/first/second'))).toBe('first');
    expect(UrlUtils.extractFirstUrlSegmentPath(createSegmentsFromUrl(router, '/first?argument=value'))).toBe('first');
    expect(UrlUtils.extractFirstUrlSegmentPath(createSegmentsFromUrl(router, 'first/second/third?argument=value'))).toBe('first');
    expect(UrlUtils.extractFirstUrlSegmentPath(createSegmentsFromUrl(router, '//first/second/third?argument=value'))).toBe('first');

    expect(UrlUtils.extractFirstUrlSegmentPath(createSegmentsFromUrl(router, '%ç*/*ç%&/&%//*ç%/'))).toBe('');
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

  it('should compare two segment path arrays for equality', () => {
    expect(UrlUtils.areSegmentPathsEqual([], [])).toBeTrue();
    expect(UrlUtils.areSegmentPathsEqual(['path01'], ['path01'])).toBeTrue();
    expect(UrlUtils.areSegmentPathsEqual(['path01', 'path02'], ['path01', 'path02'])).toBeTrue();

    expect(UrlUtils.areSegmentPathsEqual(['path01'], [])).toBeFalse();
    expect(UrlUtils.areSegmentPathsEqual([], ['path01'])).toBeFalse();
    expect(UrlUtils.areSegmentPathsEqual(['path01'], ['path02'])).toBeFalse();
    expect(UrlUtils.areSegmentPathsEqual(['path01', 'path02'], ['path01'])).toBeFalse();
    expect(UrlUtils.areSegmentPathsEqual(['path01'], ['path01', 'path02'])).toBeFalse();
    expect(UrlUtils.areSegmentPathsEqual(['path02', 'path01'], ['path01', 'path02'])).toBeFalse();
  });

  it('should compare two segment path arrays to check if the first is contained in the second', () => {
    expect(UrlUtils.containsSegmentPaths([], [])).toBeTrue();
    expect(UrlUtils.containsSegmentPaths([], ['path01'])).toBeTrue();
    expect(UrlUtils.containsSegmentPaths(['path01'], ['path01'])).toBeTrue();
    expect(UrlUtils.containsSegmentPaths(['path01', 'path02'], ['path01', 'path02'])).toBeTrue();
    expect(UrlUtils.containsSegmentPaths(['path01'], ['path01', 'path02'])).toBeTrue();

    expect(UrlUtils.containsSegmentPaths(['path01'], [])).toBeFalse();
    expect(UrlUtils.containsSegmentPaths(['path01'], ['path02'])).toBeFalse();
    expect(UrlUtils.containsSegmentPaths(['path01', 'path02'], ['path01'])).toBeFalse();
    expect(UrlUtils.containsSegmentPaths(['path02', 'path01'], ['path01', 'path02'])).toBeFalse();
  });
});
