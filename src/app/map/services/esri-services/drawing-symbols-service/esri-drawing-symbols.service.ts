import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {catchError, map, Observable, shareReplay, throwError} from 'rxjs';
import {EsriSymbolDescriptorFetchingFailed, EsriSymbolDescriptorToSVGFailed} from '../errors/esri.errors';
import {DrawingSymbolsService} from 'src/app/shared/interfaces/drawing-symbols-service.interface';
import {EsriMapDrawingSymbol} from '../types/esri-map-drawing-symbol.type';
import {EsriDrawingSymbolDefinition} from '../tool-service/strategies/drawing/drawing-symbol/esri-drawing-symbol-definition';
import {EsriDrawingSymbolDescriptor} from '../tool-service/strategies/drawing/drawing-symbol/esri-drawing-symbol-descriptor';
import {EsriDrawingSymbolChoice} from '../tool-service/strategies/drawing/drawing-symbol/esri-drawing-symbol-choice';
import {EsriApiDrawingSymbolsCollectionResponse} from '../types/esri-api-drawing-symbols-collection-response.type';

@Injectable({
  providedIn: 'root',
})
export class EsriDrawingSymbolsService implements DrawingSymbolsService {
  public static readonly ESRI_SYMBOL_COLLECTIONS = [
    {
      label: 'Tiere',
      id: '1fbb242c54e4415d9b8e8a343ca7a9d0',
    },
    {
      label: 'Pfeile',
      id: 'eef578633a3e41b985d0c980275c6d74',
    },
    {
      label: 'Gebäude',
      id: 'fe12ab0e0c834ca2adff4e10f68e1327',
    },
    {
      label: 'Öffentliche Hand',
      id: '6eeef46c653b40c9bda04f9bed913b70',
    },
    {
      label: 'Landschaften 1',
      id: 'e9cb6bb3273342b69628e0da4be1b60c',
    },
    {
      label: 'Landschaften 2',
      id: '8560ce55ee7547a0b6b1d59df76d3f6b',
    },
    {
      label: 'Nationalpark/Naturpark',
      id: '36359a4a8f3143b6bf44d5688e007900',
    },
    {
      label: 'Orte von Interesse',
      id: '11e7b433c72a4cef90c8a428de131147',
    },
    {
      label: 'Öffentliche Sicherheit',
      id: 'b117b6e14d7b429a9ea8c58a5cb6abad',
    },
    {
      label: 'Bäume',
      id: 'e08037675f354ea1bab42359b9a0c04b',
    },
    {
      label: 'UN OCHA',
      id: '806df898e9c04516a704a9f93e2a0a5e',
    },
  ];

  private collectionCache = new Map<string, Observable<EsriDrawingSymbolChoice[]>>();
  public readonly drawingSymbolsDataBaseUrl = 'https://cdn.arcgis.com/sharing/rest/content/items/';
  private httpClient = inject(HttpClient);

  public getCollectionInfos() {
    return EsriDrawingSymbolsService.ESRI_SYMBOL_COLLECTIONS;
  }

  public getCollection(collectionId: string): Observable<EsriDrawingSymbolChoice[]> {
    if (this.collectionCache.has(collectionId)) {
      return this.collectionCache.get(collectionId)!;
    }

    const collectionUrl = this.drawingSymbolsDataBaseUrl + collectionId;

    const request$ = this.httpClient.get<EsriApiDrawingSymbolsCollectionResponse>(`${collectionUrl}/data`).pipe(
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
