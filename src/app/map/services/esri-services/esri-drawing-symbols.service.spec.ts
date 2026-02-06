import {EsriDrawingSymbolDescriptor} from './tool-service/strategies/drawing/drawing-symbol/esri-drawing-symbol-descriptor';
import {TestBed} from '@angular/core/testing';
import {EsriDrawingSymbolsService} from './esri-drawing-symbols.service';
import {TIME_SERVICE} from 'src/app/app.tokens';
import {DayjsService} from 'src/app/shared/services/dayjs.service';
import {provideMockStore} from '@ngrx/store/testing';
import {HttpClient, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {EsriDrawingSymbolDefinition} from './tool-service/strategies/drawing/drawing-symbol/esri-drawing-symbol-definition';
import {EsriSymbolDescriptorFetchingFailed, EsriSymbolDescriptorToSVGFailed} from './errors/esri.errors';
import {EsriApiDrawingSymbolsCollectionResponse} from './types/esri-api-drawing-symbols-collection-response.type';
import {of} from 'rxjs';

const testData: EsriApiDrawingSymbolsCollectionResponse = {
  cimVersion: '1408',
  items: [
    {
      name: 'A',
      title: 'A',
      itemType: 'pointSymbol',
      dimensionality: 'yes',
      format: ['cim'],
      cimRef: 'A',
      thumbnail: {
        href: 'https://www.example.com/thumbnail_A.png',
      },
    },
    {
      name: 'B',
      title: 'B',
      itemType: 'some type',
      dimensionality: 'yes',
      format: ['cim'],
      cimRef: 'B',
      thumbnail: {
        href: 'https://www.example.com/thumbnail_B.png',
      },
    },
    {
      name: 'C',
      title: 'C',
      itemType: 'pointSymbol',
      dimensionality: 'yes',
      format: ['cim'],
      cimRef: 'C',
      thumbnail: {
        href: './thumbnail_C.png',
      },
    },
  ],
};

describe('EsriDrawingSymbolsService', () => {
  let service: EsriDrawingSymbolsService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EsriDrawingSymbolsService,
        provideMockStore({}),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        {provide: TIME_SERVICE, useClass: DayjsService},
      ],
    });

    service = TestBed.inject(EsriDrawingSymbolsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should return collection infos', () => {
    const collections = service.getCollectionInfos();

    expect(Object.values(collections).length).toBeGreaterThan(0);
  });

  it('should differentiate different symbols', () => {
    const symbolA = new EsriDrawingSymbolDefinition({styleUrl: 'a'});
    const symbolB = new EsriDrawingSymbolDefinition({styleUrl: 'b'});
    const symbolC = new EsriDrawingSymbolDefinition({styleUrl: 'a'});

    expect(service.isSameSymbol(symbolA, symbolB)).toBeFalse();
    expect(service.isSameSymbol(symbolA, symbolC)).toBeTrue();
    expect(service.isSameSymbol(symbolB, symbolC)).toBeFalse();
  });

  it('should create a drawing symbol definition and descriptor from JSON', async () => {
    const drawingSymbolDefinitionMock = jasmine.createSpyObj<EsriDrawingSymbolDefinition>('EsriDrawingSymbolDefinition', [
      'fetchDrawingSymbolDescriptor',
    ]);
    const drawingSymbolDescriptorMock = jasmine.createSpyObj<EsriDrawingSymbolDescriptor>('EsriDrawingSymbolDescriptor', ['toSVG']);

    const fromJsonSpy = spyOn(EsriDrawingSymbolDefinition, 'fromJSON').and.returnValue(drawingSymbolDefinitionMock);
    const fetchDrawingSymbolDescriptorSpy =
      drawingSymbolDefinitionMock.fetchDrawingSymbolDescriptor.and.resolveTo(drawingSymbolDescriptorMock);

    const actual = await service.mapDrawingSymbolFromJSON('some json');

    expect(fromJsonSpy).toHaveBeenCalledWith('some json');
    expect(fetchDrawingSymbolDescriptorSpy).toHaveBeenCalled();
    expect(actual.drawingSymbolDefinition).toEqual(drawingSymbolDefinitionMock);
    expect(actual.drawingSymbolDescriptor).toEqual(drawingSymbolDescriptorMock);
  });

  it('should convert a given symbol definition to a map drawing symbol correctly', async () => {
    const drawingSymbolDefinitionMock = jasmine.createSpyObj<EsriDrawingSymbolDefinition>('EsriDrawingSymbolDefinition', [
      'fetchDrawingSymbolDescriptor',
    ]);
    const drawingSymbolDescriptorMock = jasmine.createSpyObj<EsriDrawingSymbolDescriptor>('EsriDrawingSymbolDescriptor', ['toSVG']);

    const fromJsonSpy = spyOn(EsriDrawingSymbolDefinition, 'fromJSON').and.returnValue(drawingSymbolDefinitionMock);
    const fetchDrawingSymbolDescriptorSpy =
      drawingSymbolDefinitionMock.fetchDrawingSymbolDescriptor.and.resolveTo(drawingSymbolDescriptorMock);

    const actual = await service.convertToMapDrawingSymbol(drawingSymbolDefinitionMock, 10, 12);

    expect(fromJsonSpy).not.toHaveBeenCalled();
    expect(fetchDrawingSymbolDescriptorSpy).toHaveBeenCalledWith(10, 12);
    expect(actual.drawingSymbolDefinition).toEqual(drawingSymbolDefinitionMock);
    expect(actual.drawingSymbolDescriptor).toEqual(drawingSymbolDescriptorMock);
  });

  it('should convert a given drawing symbol descriptor to SVG correctly', () => {
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const drawingSymbolDescriptorMock = jasmine.createSpyObj<EsriDrawingSymbolDescriptor>('EsriDrawingSymbolDescriptor', ['toSVG']);
    drawingSymbolDescriptorMock.toSVG.and.returnValue(svgEl);

    const actual = service.getSVGString(drawingSymbolDescriptorMock, 123);

    expect(actual).toBe('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIzIiBoZWlnaHQ9IjEyMyI+PC9zdmc+');
  });

  it('should should throw an error if SVG conversion failed for whatever reason', () => {
    const drawingSymbolDescriptorMock = jasmine.createSpyObj<EsriDrawingSymbolDescriptor>('EsriDrawingSymbolDescriptor', ['toSVG']);
    drawingSymbolDescriptorMock.toSVG.and.returnValue(undefined);

    expect(() => service.getSVGString(drawingSymbolDescriptorMock, 10)).toThrow(new EsriSymbolDescriptorToSVGFailed());
  });

  it('should make a request to get a collection and cache the result', () => {
    const httpClient = TestBed.inject(HttpClient);
    const getCallSpy = spyOn(httpClient, 'get').and.returnValue(of(testData));
    service.getCollection('806df898e9c04516a704a9f93e2a0a5e').subscribe((actual) => {
      expect(actual.length).toBe(2);
      expect(actual[0].thumbnail).toEqual('https://www.example.com/thumbnail_A.png');
      expect(actual[1].thumbnail).toEqual(
        'https://cdn.arcgis.com/sharing/rest/content/items/806df898e9c04516a704a9f93e2a0a5e/./thumbnail_C.png',
      );
    });

    service.getCollection('806df898e9c04516a704a9f93e2a0a5e').subscribe((actual) => {
      expect(actual.length).toBe(2);
    });

    expect(getCallSpy).toHaveBeenCalledWith('https://cdn.arcgis.com/sharing/rest/content/items/806df898e9c04516a704a9f93e2a0a5e/data');
    expect(getCallSpy).toHaveBeenCalledTimes(1);
  });

  it('should catch any HTTP error and throw an appropriate error when trying to fetch a collection', () => {
    service.getCollection('806df898e9c04516a704a9f93e2a0a5e').subscribe({
      next: () => fail('next should not be called'),
      error: (err: unknown) => {
        expect((err as Error).message).toBe(new EsriSymbolDescriptorFetchingFailed().message);
      },
    });

    const req = httpTestingController.expectOne('https://cdn.arcgis.com/sharing/rest/content/items/806df898e9c04516a704a9f93e2a0a5e/data');
    req.flush('Boom', {
      status: 500,
      statusText: 'Server Error',
    });
  });

  it('should only make one HTTP call, even with multiple subscribers', () => {
    const observable = service.getCollection('806df898e9c04516a704a9f93e2a0a5e');

    observable.subscribe();
    observable.subscribe();

    const req = httpTestingController.expectOne('https://cdn.arcgis.com/sharing/rest/content/items/806df898e9c04516a704a9f93e2a0a5e/data');
    expect(req.request.method).toBe('GET');
  });
});
