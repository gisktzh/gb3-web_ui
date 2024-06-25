import {Inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of, switchMap, tap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {ImportActions} from '../actions/import.actions';
import {Gb3ImportService} from '../../../shared/services/apis/gb3/gb3-import.service';
import {FileImportError} from '../../../shared/errors/file-upload.errors';
import {DEFAULT_INTERNAL_STYLE, SymbolizationToGb3ConverterUtils} from '../../../shared/utils/symbolization-to-gb3-converter.utils';
import {UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {MAP_SERVICE} from '../../../app.module';
import {MapService} from '../../../map/interfaces/map.service';
import {ActiveMapItemFactory} from '../../../shared/factories/active-map-item.factory';
import {MapConstants} from '../../../shared/constants/map.constants';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {DrawingActions} from '../actions/drawing.actions';

@Injectable()
export class ImportEffects {
  public requestImportDrawings$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ImportActions.requestDrawingsImport),
      switchMap(({file}) =>
        this.importService.importDrawing(file).pipe(
          map((drawing) => ImportActions.createActiveMapItemFromDrawing({drawing})),
          catchError((error: unknown) => of(ImportActions.setDrawingsImportRequestError({error}))),
        ),
      ),
    );
  });

  public addDrawingToMap$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ImportActions.createActiveMapItemFromDrawing),
      map(({drawing}) => {
        const styledDrawing = {
          ...drawing,
          geojson: {
            ...drawing.geojson,
            features: drawing.geojson.features.map((feature) => {
              return {
                ...feature,
                properties: {
                  ...feature.properties,
                  style:
                    feature.geometry.type !== 'Point'
                      ? `GB3_INTERNAL_STYLE_${feature.geometry.type.toUpperCase()}`
                      : feature.properties.text
                        ? 'GB3_INTERNAL_STYLE_TEXT'
                        : 'GB3_INTERNAL_STYLE_POINT',
                },
              };
            }),
          },
          styles: drawing.styles ?? {
            GB3_INTERNAL_STYLE_POINT: {...DEFAULT_INTERNAL_STYLE, type: 'point'},
            GB3_INTERNAL_STYLE_TEXT: {...DEFAULT_INTERNAL_STYLE, type: 'text'},
            GB3_INTERNAL_STYLE_POLYGON: {...DEFAULT_INTERNAL_STYLE, type: 'polygon'},
            GB3_INTERNAL_STYLE_MULTIPOLYGON: {...DEFAULT_INTERNAL_STYLE, type: 'polygon'},
            GB3_INTERNAL_STYLE_LINESTRING: {...DEFAULT_INTERNAL_STYLE, type: 'line'},
            GB3_INTERNAL_STYLE_MULTILINESTRING: {...DEFAULT_INTERNAL_STYLE, type: 'line'},
          },
        };
        const activeMapItem = ActiveMapItemFactory.createDrawingMapItem(UserDrawingLayer.Drawings, MapConstants.USER_DRAWING_LAYER_PREFIX);
        const drawingsToAdd = SymbolizationToGb3ConverterUtils.convertExternalToInternalRepresentation(
          styledDrawing,
          UserDrawingLayer.Drawings,
        );
        const drawingLayersToOverride: UserDrawingLayer[] = [];
        this.mapService.removeMapItem(activeMapItem.id);
        activeMapItem.addToMap(this.mapService, 0);
        this.mapService.getToolService().addExistingDrawingsToLayer(drawingsToAdd, UserDrawingLayer.Drawings);
        drawingLayersToOverride.push(activeMapItem.settings.userDrawingLayer);
        return ImportActions.addDrawingToMap({activeMapItem, drawingLayersToOverride, drawingsToAdd});
      }),
    );
  });

  public addDrawingToActiveMapItmes$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ImportActions.addDrawingToMap),
      map(({activeMapItem}) => ActiveMapItemActions.addActiveMapItem({activeMapItem, position: 0})),
    );
  });

  public overrideExistingDrawings = createEffect(() => {
    return this.actions$.pipe(
      ofType(ImportActions.addDrawingToMap),
      map(({drawingLayersToOverride, drawingsToAdd}) =>
        DrawingActions.overwriteDrawingLayersWithDrawings({layersToOverride: drawingLayersToOverride, drawingsToAdd}),
      ),
    );
  });

  public resetLoadingStateAfterSuccessfullyAddingDrawingToMap$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ImportActions.addDrawingToMap),
      map(() => ImportActions.resetDrawingImportState()),
    );
  });

  public throwImportDrawingsRequestError$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(ImportActions.setDrawingsImportRequestError),
        tap(({error}) => {
          throw new FileImportError(error);
        }),
      );
    },
    {dispatch: false},
  );

  constructor(
    private readonly actions$: Actions,
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
    private readonly importService: Gb3ImportService,
  ) {}
}
