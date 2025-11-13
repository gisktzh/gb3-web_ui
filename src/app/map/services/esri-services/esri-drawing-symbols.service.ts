import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {EsriDrawingSymbolsCollection} from './types/esri-drawing-symbols-collection.type';
import {catchError, map, Observable, throwError} from 'rxjs';
import {DrawingSymbolsCollectionItem} from './types/drawing-symbols-collection.type';
import WebStyleSymbol from '@arcgis/core/symbols/WebStyleSymbol';

@Injectable({
  providedIn: 'root',
})
export class EsriDrawingSymbolsService {
  public readonly drawingSymbolsDataBaseUrl = 'https://cdn.arcgis.com/sharing/rest/content/items/';
  private httpClient = inject(HttpClient);

  public getCollection(collectionId: string): Observable<DrawingSymbolsCollectionItem[]> {
    const collectionUrl = this.drawingSymbolsDataBaseUrl + collectionId;

    return this.httpClient.get<EsriDrawingSymbolsCollection>(`${collectionUrl}/data`).pipe(
      map((response) =>
        response.items
          .filter((item) => item.itemType === 'pointSymbol')
          .map((item) => ({
            name: item.name,
            thumbnail: item.thumbnail.href.startsWith('.') ? `${collectionUrl}/${item.thumbnail.href}` : item.thumbnail.href,
            item: new WebStyleSymbol({
              name: item.name,
              styleUrl: `${collectionUrl}/data`,
            }),
          })),
      ),
      catchError((error: unknown) => {
        console.error('Error fetching collections or single symbol:', error);
        return throwError(() => new Error('An error occurred while fetching collections.'));
      }),
    );
  }
}
