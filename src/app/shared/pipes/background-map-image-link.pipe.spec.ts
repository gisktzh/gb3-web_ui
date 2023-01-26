import {BasemapImageLinkPipe} from './background-map-image-link.pipe';
import {ConfigService} from '../services/config.service';
import {TestBed} from '@angular/core/testing';
import {Basemap} from '../interfaces/background-map.interface';

const mockBasemaps: Basemap[] = [
  {id: 'test-1', relativeImagePath: 'path/to/image.png', url: 'https://www.my-test.com/test1', title: 'Test 1', srsId: 2056, layers: []}
];

const mockBasemapConfig = {
  availableBasemaps: mockBasemaps,
  defaultBasemap: mockBasemaps[0]
};

describe('BasemapImageLinkPipe', () => {
  let pipe: BasemapImageLinkPipe;
  let configServiceSpy: jasmine.SpyObj<ConfigService>;
  beforeEach(() => {
    const spy = jasmine.createSpyObj('ConfigService', [], {basemapConfig: mockBasemapConfig});

    TestBed.configureTestingModule({
      providers: [
        BasemapImageLinkPipe,
        {
          provide: ConfigService,
          useValue: spy
        }
      ]
    });
    pipe = TestBed.inject(BasemapImageLinkPipe);
    configServiceSpy = TestBed.inject(ConfigService) as jasmine.SpyObj<ConfigService>;
  });

  it('returns the correct  for existing id', () => {
    const testIdentifier = mockBasemaps[0].id;

    const result = pipe.transform(testIdentifier);

    const expected = mockBasemaps[0].relativeImagePath;
    expect(result).toEqual(expected);
  });

  it('returns the empty string if id does not exist', () => {
    const testIdentifier = 'does-not-exist';

    const result = pipe.transform(testIdentifier);

    const expected = '';
    expect(result).toEqual(expected);
  });
});
