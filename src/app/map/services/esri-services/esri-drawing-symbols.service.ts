import {Injectable} from '@angular/core';
import {catchError, map, Observable, shareReplay, throwError} from 'rxjs';
import {EsriSymbolDescriptorFetchingFailed, EsriSymbolDescriptorToSVGFailed} from './errors/esri.errors';
import {DrawingSymbolsService} from 'src/app/shared/interfaces/drawing-symbols-service.interface';
import {EsriMapDrawingSymbol} from './types/esri-map-drawing-symbol.type';
import {EsriDrawingSymbolDefinition} from './tool-service/strategies/drawing/drawing-symbol/esri-drawing-symbol-definition';
import {EsriDrawingSymbolDescriptor} from './tool-service/strategies/drawing/drawing-symbol/esri-drawing-symbol-descriptor';
import {EsriDrawingSymbolChoice} from './tool-service/strategies/drawing/drawing-symbol/esri-drawing-symbol-choice';
import {EsriApiDrawingSymbolsCollectionResponse} from './types/esri-api-drawing-symbols-collection-response.type';
import {BaseApiService} from 'src/app/shared/services/apis/abstract-api.service';

type CollectionId = keyof ReturnType<EsriDrawingSymbolsService['getCollectionInfos']>;

@Injectable({
  providedIn: 'root',
})
export class EsriDrawingSymbolsService extends BaseApiService implements DrawingSymbolsService {
  protected override apiBaseUrl: string = '';

  private readonly collectionCache = new Map<string, Observable<EsriDrawingSymbolChoice[]>>();

  public getCollectionInfos() {
    return {
      'gb3-civil-signatures': {
        label: 'Zivile Signaturen',
        url: `${this.configService.apiConfig.gb2Api.baseUrl}/${this.configService.apiConfig.gb2Api.version}/gb3-symbols/civil-signatures`,
      },
      '1fbb242c54e4415d9b8e8a343ca7a9d0': {
        label: 'Tiere',
        url: 'https://cdn.arcgis.com/sharing/rest/content/items/1fbb242c54e4415d9b8e8a343ca7a9d0',
      },
      eef578633a3e41b985d0c980275c6d74: {
        label: 'Pfeile',
        url: 'https://cdn.arcgis.com/sharing/rest/content/items/eef578633a3e41b985d0c980275c6d74',
      },
      fe12ab0e0c834ca2adff4e10f68e1327: {
        label: 'Gebäude',
        url: 'https://cdn.arcgis.com/sharing/rest/content/items/fe12ab0e0c834ca2adff4e10f68e1327',
      },
      '6eeef46c653b40c9bda04f9bed913b70': {
        label: 'Öffentliche Hand',
        url: 'https://cdn.arcgis.com/sharing/rest/content/items/6eeef46c653b40c9bda04f9bed913b70',
      },
      e9cb6bb3273342b69628e0da4be1b60c: {
        label: 'Landschaften 1',
        url: 'https://cdn.arcgis.com/sharing/rest/content/items/e9cb6bb3273342b69628e0da4be1b60c',
      },
      '8560ce55ee7547a0b6b1d59df76d3f6b': {
        label: 'Landschaften 2',
        url: 'https://cdn.arcgis.com/sharing/rest/content/items/8560ce55ee7547a0b6b1d59df76d3f6b',
      },
      '36359a4a8f3143b6bf44d5688e007900': {
        label: 'Nationalpark/Naturpark',
        url: 'https://cdn.arcgis.com/sharing/rest/content/items/36359a4a8f3143b6bf44d5688e007900',
      },
      '11e7b433c72a4cef90c8a428de131147': {
        label: 'Orte von Interesse',
        url: 'https://cdn.arcgis.com/sharing/rest/content/items/11e7b433c72a4cef90c8a428de131147',
      },
      b117b6e14d7b429a9ea8c58a5cb6abad: {
        label: 'Öffentliche Sicherheit',
        url: 'https://cdn.arcgis.com/sharing/rest/content/items/b117b6e14d7b429a9ea8c58a5cb6abad',
      },
      e08037675f354ea1bab42359b9a0c04b: {
        label: 'Bäume',
        url: 'https://cdn.arcgis.com/sharing/rest/content/items/e08037675f354ea1bab42359b9a0c04b',
      },
      '806df898e9c04516a704a9f93e2a0a5e': {
        label: 'UN OCHA',
        url: 'https://cdn.arcgis.com/sharing/rest/content/items/806df898e9c04516a704a9f93e2a0a5e',
      },
    };
  }

  public getCollectionInfo(collectionId: CollectionId) {
    return this.getCollectionInfos()[collectionId];
  }

  public getCollection(collectionId: CollectionId): Observable<EsriDrawingSymbolChoice[]> {
    if (this.collectionCache.has(collectionId)) {
      return this.collectionCache.get(collectionId)!;
    }

    const collectionUrl = this.getCollectionInfo(collectionId).url;

    const request$ = this.get<EsriApiDrawingSymbolsCollectionResponse>(`${collectionUrl}/data`).pipe(
      map((response) =>
        response.items
          .filter((item) => item.itemType === 'pointSymbol')
          .map((item) => ({
            name: item.name,
            thumbnail: item.thumbnail.href.startsWith('.') ? `${collectionUrl}/${item.thumbnail.href}` : item.thumbnail.href,
            item: new EsriDrawingSymbolDefinition({
              name: item.name,
              styleUrl: `${collectionUrl}/data`,
            }),
          })),
      ),
      shareReplay({
        bufferSize: 1,
        refCount: false,
      }),
      catchError((error: unknown) => {
        console.error('Error fetching collections or single symbol:', error);
        return throwError(() => new EsriSymbolDescriptorFetchingFailed());
      }),
    );

    this.collectionCache.set(collectionId, request$);

    return request$;
  }

  public async convertToMapDrawingSymbol(
    symbol: EsriDrawingSymbolDefinition,
    size: number,
    rotation: number,
  ): Promise<EsriMapDrawingSymbol> {
    const esriDrawingSymbolDescriptor = await symbol.fetchDrawingSymbolDescriptor(size, rotation);

    return {
      drawingSymbolDefinition: symbol,
      drawingSymbolDescriptor: esriDrawingSymbolDescriptor,
    };
  }

  public getSVGString(symbol: EsriDrawingSymbolDescriptor, iconSize: number): string {
    const svg = symbol.toSVG();

    if (!svg) {
      throw new EsriSymbolDescriptorToSVGFailed();
    }

    svg.setAttribute('width', iconSize.toString());
    svg.setAttribute('height', iconSize.toString());

    const container = document.createElement('div');
    container.appendChild(svg);

    const svgString = container.innerHTML;

    const base64 = btoa(svgString);

    return `data:image/svg+xml;base64,${base64}`;
  }

  public async mapDrawingSymbolFromJSON(jsonString: string): Promise<EsriMapDrawingSymbol> {
    const esriDrawingSymbolDefinition = EsriDrawingSymbolDefinition.fromJSON(jsonString);
    return {
      drawingSymbolDefinition: esriDrawingSymbolDefinition,
      drawingSymbolDescriptor: await esriDrawingSymbolDefinition.fetchDrawingSymbolDescriptor(),
    };
  }

  public isSameSymbol(a: EsriDrawingSymbolDefinition, b: EsriDrawingSymbolDefinition): boolean {
    return a.name === b.name && a.styleUrl === b.styleUrl;
  }
}
