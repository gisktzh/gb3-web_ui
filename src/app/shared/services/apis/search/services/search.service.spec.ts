import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {SearchService} from './search.service';
import {HttpClient, HttpRequest} from '@angular/common/http';
import {of} from 'rxjs';
import {SearchIndex} from '../interfaces/search-index.interface';
import {ConfigService} from '../../../config.service';

describe('SearchService', () => {
  let service: SearchService;

  const searchIndexes: SearchIndex[] = [
    {indexName: 'fme-addresses', label: 'Adressen', active: true, indexType: 'addresses'},
    {indexName: 'fme-places', label: 'Orte', active: true, indexType: 'places'},
    {indexName: 'Kbs', label: 'KbS', active: true, indexType: 'activeMapItems'},
    {indexName: 'Gvz', label: 'GVZ-Nr.', active: true, indexType: 'activeMapItems'},
  ];

  const mockData: {index: string; matches: any[]}[] = [
    {
      index: 'fme-addresses',
      matches: [
        {
          displayString: 'Tor-101-Strasse 1.3, 8302 Kloten',
          score: 1.6732838,
          geometry: {
            type: 'Point',
            coordinates: [8.5621820461, 47.4487465817],
          },
        },
        {
          displayString: 'Tor-101-Strasse 11.1, 8302 Kloten',
          score: 1.6732838,
          geometry: {
            type: 'Point',
            coordinates: [8.5657755132, 47.4474019352],
          },
        },
        {
          displayString: 'Tor-101-Strasse 11.2, 8302 Kloten',
          score: 1.6732838,
          geometry: {
            type: 'Point',
            coordinates: [8.5671990943, 47.4477625061],
          },
        },
      ],
    },
    {
      index: 'fme-places',
      matches: [
        {
          displayString: 'Landesgrenzstein 14.1/1',
          score: 9.434647,
          geometry: {
            type: 'Point',
            coordinates: [10.4535432114, 46.6379642941],
          },
        },
        {
          displayString: 'Landesgrenzstein 125(1754)',
          score: 9.434647,
          geometry: {
            type: 'Point',
            coordinates: [8.9246241034, 45.8529251909],
          },
        },
        {
          displayString: 'Landesgrenzstein 12 (1930)',
          score: 9.434647,
          geometry: {
            type: 'Point',
            coordinates: [10.1748990255, 46.2545879112],
          },
        },
      ],
    },
    {
      index: 'Kbs',
      matches: [
        {
          displayString: '0261/I.1571-001',
          score: 5.383585,
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [8.5283858078, 47.348681571],
                [8.5283841209, 47.34859902],
                [8.5283165315, 47.3485979039],
                [8.5283141971, 47.3486468868],
                [8.5281487864, 47.3486432576],
                [8.5281532043, 47.3485504845],
                [8.5281226139, 47.3485490191],
                [8.5280723124, 47.3485512658],
                [8.528066191, 47.3486727406],
                [8.5281098528, 47.3486739478],
                [8.5283858078, 47.348681571],
              ],
            ],
          },
        },
        {
          displayString: '0247/I.1014-001',
          score: 5.383585,
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [8.4476420506, 47.4039314541],
                [8.4476404394, 47.4038463853],
                [8.4475019754, 47.4038646123],
                [8.4475030164, 47.4039195802],
                [8.4476420506, 47.4039314541],
              ],
            ],
          },
        },
      ],
    },
    {
      index: 'Gvz',
      matches: [
        {
          displayString: '1267',
          score: 2.1905336,
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [8.4398936813, 47.3952625371],
                [8.4398905522, 47.3952609722],
                [8.4399683716, 47.395194419],
                [8.4400220981, 47.3951484751],
                [8.4400230348, 47.3951489797],
                [8.4400278978, 47.3951448269],
                [8.4399897715, 47.395124271],
                [8.4399937999, 47.3951208181],
                [8.4399611603, 47.3951032189],
                [8.439957132, 47.3951066719],
                [8.4399095723, 47.3950810886],
                [8.4399055171, 47.3950845239],
                [8.4399064539, 47.3950850285],
                [8.4398777811, 47.3951093383],
                [8.4398851286, 47.3951133314],
                [8.4397752775, 47.395206625],
                [8.439773622, 47.3952080516],
                [8.4397768337, 47.3952097777],
                [8.439890818, 47.3952652514],
                [8.4398936813, 47.3952625371],
              ],
            ],
          },
        },
        {
          displayString: '121',
          score: 2.1905336,
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [8.4370490678, 47.3952137939],
                [8.4369388942, 47.3951968098],
                [8.4369291567, 47.3952271528],
                [8.4369124563, 47.3952245267],
                [8.4369120041, 47.3952258438],
                [8.4368966517, 47.395271131],
                [8.4370233172, 47.395290914],
                [8.4370490678, 47.3952137939],
              ],
            ],
          },
        },
      ],
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(SearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send a search request including all search indexes', () => {
    const configService = TestBed.inject(ConfigService);
    const httpTestingController = TestBed.inject(HttpTestingController);
    const searchTerm = 'testTerm';
    service.searchIndexes(searchTerm, searchIndexes).subscribe();

    const {request} = httpTestingController.expectOne((req: HttpRequest<any>) =>
      req.url.includes(`${configService.apiConfig.searchApi.baseUrl}/search`),
    );
    searchIndexes.forEach((index) => {
      expect(request.url.includes(index.indexName)).toBeTrue();
    });
    expect(request.url.includes(searchTerm)).toBeTrue();
  });

  it('should receive search results and transform them', (done: DoneFn) => {
    const httpClient = TestBed.inject(HttpClient);
    spyOn(httpClient, 'get').and.returnValue(of(mockData));

    const searchTerm = '1';
    service.searchIndexes(searchTerm, searchIndexes).subscribe((resultMatches) => {
      expect(resultMatches).toBeDefined();
      expect(resultMatches.length).toBe(mockData.flatMap((data) => data.matches).length);
      resultMatches.forEach((match) => {
        expect(searchIndexes.map((index) => index.indexType)).toContain(match.indexType);
        expect(match.score).toBeGreaterThan(0);
        expect(match.indexName).toBeDefined();
        switch (match.indexType) {
          case 'addresses':
            expect(match.geometry.srs).toEqual(4326);
            expect(match.indexName).toEqual('Adressen');
            expect(match.displayString).not.toEqual('');
            break;
          case 'places':
            expect(match.geometry.srs).toEqual(4326);
            expect(match.indexName).toEqual('Orte');
            expect(match.displayString).not.toEqual('');
            break;
          case 'activeMapItems':
            expect(match.geometry.srs).toEqual(4326);
            expect(searchIndexes.filter((index) => index.indexType === 'activeMapItems').map((index) => index.label)).toContain(
              match.indexName!,
            );
            expect(match.displayString).not.toEqual('');
            break;
          case 'metadata-maps':
          case 'metadata-products':
          case 'metadata-datasets':
          case 'metadata-services':
          case 'unknown':
            fail('Unexpected index type');
        }
      });
      done();
    });
  });
});
