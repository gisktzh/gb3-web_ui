import {BasemapImageLinkPipe} from './background-map-image-link.pipe';
import {TestBed} from '@angular/core/testing';
import {Basemap, BlankBasemap, WmsBasemap} from '../interfaces/basemap.interface';
import {BasemapConfigService} from 'src/app/map/services/basemap-config.service';

const wmsBasemap: WmsBasemap = {
  id: 'test-1',
  type: 'wms',
  relativeImagePath: 'path/to/image.png',
  url: 'https://www.my-test.com/test1',
  title: 'Test 1',
  srsId: 2056,
  layers: [],
};
const blankBasemap: BlankBasemap = {id: 'test-2', type: 'blank', title: 'Test 2'};

const mockBasemaps: Basemap[] = [wmsBasemap, blankBasemap];

describe('BasemapImageLinkPipe', () => {
  let pipe: BasemapImageLinkPipe;
  beforeEach(() => {
    const spy = {
      availableBasemaps: mockBasemaps,
    };

    TestBed.configureTestingModule({
      providers: [
        BasemapImageLinkPipe,
        {
          provide: BasemapConfigService,
          useValue: spy,
        },
      ],
    });
    pipe = TestBed.inject(BasemapImageLinkPipe);
  });

  it('returns the correct image path for existing id', () => {
    const testIdentifier = wmsBasemap.id;

    const result = pipe.transform(testIdentifier);

    const expected = wmsBasemap.relativeImagePath;
    expect(result).toEqual(expected);
  });

  it('returns the empty string if id does not exist', () => {
    const testIdentifier = 'does-not-exist';

    const result = pipe.transform(testIdentifier);

    const expected = '';
    expect(result).toEqual(expected);
  });

  it('returns the empty string if id is undefined', () => {
    const testIdentifier = undefined;

    const result = pipe.transform(testIdentifier);

    const expected = '';
    expect(result).toEqual(expected);
  });

  it('returns the empty string if id belongs to a blank basemap', () => {
    const testIdentifier = blankBasemap.id;

    const result = pipe.transform(testIdentifier);

    const expected = '';
    expect(result).toEqual(expected);
  });
});
