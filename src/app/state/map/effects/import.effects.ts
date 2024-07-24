import {Inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of, switchMap, tap} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {ImportActions} from '../actions/import.actions';
import {Gb3ImportService} from '../../../shared/services/apis/gb3/gb3-import.service';
import {FileImportError} from '../../../shared/errors/file-upload.errors';
import {SymbolizationToGb3ConverterUtils} from '../../../shared/utils/symbolization-to-gb3-converter.utils';
import {UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {MAP_SERVICE} from '../../../app.module';
import {MapService} from '../../../map/interfaces/map.service';
import {ActiveMapItemFactory} from '../../../shared/factories/active-map-item.factory';
import {MapConstants} from '../../../shared/constants/map.constants';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {DrawingActions} from '../actions/drawing.actions';
import {Gb3GeoJsonFeature} from '../../../shared/interfaces/gb3-vector-layer.interface';

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
        const activeMapItem = ActiveMapItemFactory.createDrawingMapItem(UserDrawingLayer.Drawings, MapConstants.USER_DRAWING_LAYER_PREFIX);
        const drawingsToAdd = SymbolizationToGb3ConverterUtils.convertExternalToInternalRepresentation(drawing, UserDrawingLayer.Drawings);
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

  public overrideExistingDrawings$ = createEffect(() => {
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

  private getStyleName(feature: Gb3GeoJsonFeature): string {
    if (feature.geometry.type === 'Point') {
      return feature.properties.text ? 'GB3_INTERNAL_STYLE_TEXT' : 'GB3_INTERNAL_STYLE_POINT';
    }
    return `GB3_INTERNAL_STYLE_${feature.geometry.type.toUpperCase()}`;
  }

  constructor(
    private readonly actions$: Actions,
    @Inject(MAP_SERVICE) private readonly mapService: MapService,
    private readonly importService: Gb3ImportService,
  ) {}
}
