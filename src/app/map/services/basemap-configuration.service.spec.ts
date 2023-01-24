import {TestBed} from '@angular/core/testing';

import {BasemapConfigService} from './basemap-config.service';
import {Basemap} from '../../shared/interfaces/background-map.interface';
import {ConfigService} from '../../shared/services/config.service';

const mockBasemaps: Basemap[] = [
  {id: 'test-1', url: 'https://www.my-test.com/test1', title: 'Test 1', srsId: 2056, layers: []},
  {id: 'test-2', url: 'https://www.my-test.com/test2', title: 'Test 2', srsId: 2056, layers: []},
  {id: 'test-3', url: 'https://www.my-test.com/test3', title: 'Test 3', srsId: 2056, layers: []}
];

const mockBasemapConfig = {
  availableBasemaps: mockBasemaps,
  defaultBasemap: mockBasemaps[0]
};

describe('BasemapConfigService', () => {
  let service: BasemapConfigService;
  let configServiceSpy: jasmine.SpyObj<ConfigService>;
  beforeEach(() => {
    const spy = jasmine.createSpyObj('ConfigService', [], {basemapConfig: mockBasemapConfig});

    TestBed.configureTestingModule({
      providers: [
        BasemapConfigService,
        {
          provide: ConfigService,
          useValue: spy
        }
      ]
    });
    service = TestBed.inject(BasemapConfigService);
    configServiceSpy = TestBed.inject(ConfigService) as jasmine.SpyObj<ConfigService>;
  });

  describe('get availableBasemaps', () => {
    it('should return all defined basemaps from the ConfigService', () => {
      expect(service.availableBasemaps).toEqual(mockBasemaps);
    });
  });

  describe('checkBasemapIdOrGetDefault', () => {
    it('should return the same id if it exists in the config', () => {
      const testId = mockBasemaps[0].id;
      expect(service.checkBasemapIdOrGetDefault(testId)).toEqual(testId);
    });

    it('should return the lower-cased id if it exists but is supplied as upper-case', () => {
      const testId = mockBasemaps[0].id.toUpperCase();

      const expected = mockBasemaps[0].id;

      expect(service.checkBasemapIdOrGetDefault(testId)).toEqual(expected);
    });

    it('should return the default id if id does not exist', () => {
      const testId = 'this-id-does-not-exist';

      const expected = mockBasemapConfig.defaultBasemap.id;

      expect(service.checkBasemapIdOrGetDefault(testId)).toEqual(expected);
    });

    [{testId: undefined}, {testId: null}, {testId: ''}, {testId: '   '}].forEach(({testId}) => {
      it(`should return the default id if id is ${testId}`, () => {
        const expected = mockBasemapConfig.defaultBasemap.id;

        expect(service.checkBasemapIdOrGetDefault(testId)).toEqual(expected);
      });
    });
  });
});
