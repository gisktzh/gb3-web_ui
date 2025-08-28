import {Injectable, OnDestroy, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {Gb3FavouritesService} from '../../shared/services/apis/gb3/gb3-favourites.service';
import {Observable, Subscription, switchMap, tap, withLatestFrom} from 'rxjs';
import {ActiveMapItem} from '../models/active-map-item.model';
import {Favourite, FavouritesResponse} from '../../shared/interfaces/favourite.interface';
import {
  FavouriteFilterConfiguration,
  FilterConfiguration,
  Map,
  TimeSliderConfiguration,
  TimeSliderLayerSource,
} from '../../shared/interfaces/topic.interface';
import {produce} from 'immer';
import {ActiveMapItemFactory} from '../../shared/factories/active-map-item.factory';
import {ActiveMapItemConfiguration} from '../../shared/interfaces/active-map-item-configuration.interface';
import {selectActiveMapItemConfigurations} from '../../state/map/selectors/active-map-item-configuration.selector';
import {FavoritesDetailData} from '../../shared/models/gb3-api-generated.interfaces';

import {selectMaps} from '../../state/map/selectors/maps.selector';
import {selectFavouriteBaseConfig} from '../../state/map/selectors/favourite-base-config.selector';
import {FavouriteIsInvalid} from '../../shared/errors/favourite.errors';
import {selectUserDrawingsVectorLayers} from '../../state/map/selectors/user-drawings-vector-layers.selector';
import {Gb3VectorLayer} from '../../shared/interfaces/gb3-vector-layer.interface';
import {DrawingLayerPrefix, UserDrawingLayer} from '../../shared/enums/drawing-layer.enum';
import {SymbolizationToGb3ConverterUtils} from '../../shared/utils/symbolization-to-gb3-converter.utils';
import {DrawingActiveMapItem} from '../models/implementations/drawing.model';
import {Gb3StyledInternalDrawingRepresentation} from '../../shared/interfaces/internal-drawing-representation.interface';
import {TimeExtent} from '../interfaces/time-extent.interface';
import {TimeSliderService} from './time-slider.service';
import {TimeService} from '../../shared/interfaces/time-service.interface';

import {TIME_SERVICE} from '../../app.tokens';

@Injectable({
  providedIn: 'root',
})
export class FavouritesService implements OnDestroy {
  private readonly store = inject(Store);
  private readonly gb3FavouritesService = inject(Gb3FavouritesService);
  private readonly timeSliderService = inject(TimeSliderService);
  private readonly timeService = inject<TimeService>(TIME_SERVICE);

  private activeMapItemConfigurations: ActiveMapItemConfiguration[] = [];
  private availableMaps: Map[] = [];
  private readonly activeMapItemConfigurations$ = this.store.select(selectActiveMapItemConfigurations);
  private readonly availableMaps$ = this.store.select(selectMaps);
  private readonly favouriteBaseConfig$ = this.store.select(selectFavouriteBaseConfig);
  private readonly subscriptions: Subscription = new Subscription();
  private readonly userDrawingsVectorLayers$ = this.store.select(selectUserDrawingsVectorLayers);

  constructor() {
    this.initSubscriptions();
  }

  public createFavourite(title: string): Observable<FavoritesDetailData> {
    return this.userDrawingsVectorLayers$.pipe(
      withLatestFrom(this.favouriteBaseConfig$),
      switchMap(([{measurements, drawings}, baseConfig]) => {
        return this.gb3FavouritesService.createFavourite({
          title,
          content: this.activeMapItemConfigurations,
          baseConfig,
          measurements,
          drawings,
        });
      }),
    );
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public loadFavourites(): Observable<FavouritesResponse> {
    return this.gb3FavouritesService.loadFavourites();
  }

  /**
   * Gets the active map items configured as per a saved favourite combination.
   *
   * Might throw in the following cases:
   * * A configuration declares a singleLayer, but its specified subLayer does not exist
   * * A configuration declares a map that does not exist
   *
   * Throws at the first occurrence of an error - this is to ensure that a favourite is somewhat stable, instead of showing only those parts
   * of the favourite that exist.
   * @param activeMapItemConfigurations
   * @param ignoreErrors indicating whether any error should be ignored. Default: false
   */
  public getActiveMapItemsForFavourite(
    activeMapItemConfigurations: ActiveMapItemConfiguration[],
    ignoreErrors: boolean = false,
  ): ActiveMapItem[] {
    const activeMapItems: ActiveMapItem[] = [];

    activeMapItemConfigurations.forEach((configuration) => {
      const existingMap = this.availableMaps.find((availableMap) => availableMap.id === configuration.mapId);

      if (existingMap) {
        if (configuration.isSingleLayer) {
          const activeMapItem = this.createSingleLayerMapItem(existingMap, configuration, ignoreErrors);
          if (activeMapItem) {
            activeMapItems.push(activeMapItem);
          }
        } else {
          const activeMapItem = this.createMultiLayerMapItem(existingMap, configuration, ignoreErrors);
          activeMapItems.push(activeMapItem);
        }
      } else if (!ignoreErrors) {
        throw new FavouriteIsInvalid(`Die Karte '${configuration.mapId}' existiert nicht (mehr).`);
      }
    });

    return activeMapItems;
  }

  public deleteFavourite(favourite: Favourite): Observable<void> {
    return this.gb3FavouritesService.deleteFavourite(favourite);
  }

  /**
   * Gets the drawing layer configuration for a given favourite by extracting the required ActiveMapItems as well as all the geometries
   * to add.
   * @param drawings
   * @param measurements
   */
  public getDrawingsForFavourite(
    drawings: Gb3VectorLayer,
    measurements: Gb3VectorLayer,
  ): {
    drawingsToAdd: Gb3StyledInternalDrawingRepresentation[];
    drawingActiveMapItems: DrawingActiveMapItem[];
  } {
    const drawingActiveMapItems: DrawingActiveMapItem[] = [];
    const drawingsToAdd: Gb3StyledInternalDrawingRepresentation[] = [];

    if (measurements.geojson.features.length > 0) {
      drawingActiveMapItems.push(ActiveMapItemFactory.createDrawingMapItem(UserDrawingLayer.Measurements, DrawingLayerPrefix.Drawing));
      drawingsToAdd.push(
        ...SymbolizationToGb3ConverterUtils.convertExternalToInternalRepresentation(measurements, UserDrawingLayer.Measurements),
      );
    }

    if (drawings.geojson.features.length > 0) {
      drawingActiveMapItems.push(ActiveMapItemFactory.createDrawingMapItem(UserDrawingLayer.Drawings, DrawingLayerPrefix.Drawing));
      drawingsToAdd.push(...SymbolizationToGb3ConverterUtils.convertExternalToInternalRepresentation(drawings, UserDrawingLayer.Drawings));
    }

    return {
      drawingActiveMapItems,
      drawingsToAdd,
    };
  }

  private initSubscriptions() {
    this.subscriptions.add(this.availableMaps$.pipe(tap((value) => (this.availableMaps = value))).subscribe());
    this.subscriptions.add(
      this.activeMapItemConfigurations$
        .pipe(tap((activeMapItemConfigurations) => (this.activeMapItemConfigurations = activeMapItemConfigurations)))
        .subscribe(),
    );
  }

  private createSingleLayerMapItem(
    existingMap: Map,
    configuration: ActiveMapItemConfiguration,
    ignoreErrors: boolean,
  ): ActiveMapItem | undefined {
    let activeMapItem: ActiveMapItem | undefined = undefined;
    const subLayer = existingMap.layers.find((layer) => layer.layer === configuration.layers[0].layer);

    const filterConfigurations: FilterConfiguration[] | undefined = existingMap.filterConfigurations
      ? this.synchronizeFilterConfigurationsAndAttributeFilters(
          existingMap.filterConfigurations,
          configuration.attributeFilters,
          existingMap.title,
          ignoreErrors,
        )
      : undefined;

    let timeExtent: TimeExtent | undefined = configuration.timeExtent;
    if (existingMap.timeSliderConfiguration && configuration.timeExtent) {
      timeExtent = this.validateTimeExtentOrCreateDefault(
        existingMap.timeSliderConfiguration,
        configuration.timeExtent,
        ignoreErrors,
        existingMap.title,
      );
    }

    if (subLayer) {
      activeMapItem = ActiveMapItemFactory.createGb2WmsMapItem(
        existingMap,
        subLayer,
        configuration.visible,
        configuration.opacity,
        timeExtent,
        filterConfigurations,
      );
    } else if (!ignoreErrors) {
      throw new FavouriteIsInvalid(`Der Layer '${configuration.layers[0].layer}' existiert nicht (mehr).`);
    }
    return activeMapItem;
  }

  private createMultiLayerMapItem(existingMap: Map, configuration: ActiveMapItemConfiguration, ignoreErrors: boolean): ActiveMapItem {
    const adjustedMap = produce(existingMap, (draft) => {
      draft.layers.forEach((layer) => {
        const sublayerConfiguration = configuration.layers.find((favLayer) => favLayer.layer === layer.layer);

        // hide sublayer if it is a newly added layer to not interfere with favourite composition
        layer.visible = sublayerConfiguration ? sublayerConfiguration.visible : false;
      });
      // ensure consistent sorting order with saved configuration in favourite
      const sortIds = configuration.layers.map((layer) => layer.id);
      draft.layers.sort((a, b) => sortIds.indexOf(a.id) - sortIds.indexOf(b.id));
    });

    const filterConfigurations: FilterConfiguration[] | undefined = existingMap.filterConfigurations
      ? this.synchronizeFilterConfigurationsAndAttributeFilters(
          existingMap.filterConfigurations,
          configuration.attributeFilters,
          existingMap.title,
          ignoreErrors,
        )
      : undefined;

    let timeExtent: TimeExtent | undefined = undefined;
    if (existingMap.timeSliderConfiguration && configuration.timeExtent) {
      timeExtent = this.validateTimeExtentOrCreateDefault(
        existingMap.timeSliderConfiguration,
        configuration.timeExtent,
        ignoreErrors,
        existingMap.title,
      );
    }

    return ActiveMapItemFactory.createGb2WmsMapItem(
      adjustedMap,
      undefined,
      configuration.visible,
      configuration.opacity,
      timeExtent,
      filterConfigurations,
    );
  }

  private validateTimeExtentOrCreateDefault(
    timeSliderConfiguration: TimeSliderConfiguration,
    timeExtent: TimeExtent,
    ignoreErrors: boolean,
    title: string,
  ): TimeExtent {
    const isValid = this.validateTimeSlider(timeSliderConfiguration, timeExtent);
    if (!isValid) {
      if (ignoreErrors) {
        return this.timeSliderService.createInitialTimeSliderExtent(timeSliderConfiguration);
      } else {
        throw new FavouriteIsInvalid(`Die Konfiguration für den Zeitschieberegler der Karte '${title}' ist ungültig.`);
      }
    }
    return timeExtent;
  }

  private synchronizeFilterConfigurationsAndAttributeFilters(
    filterConfigurations: FilterConfiguration[],
    attributeFilters: FavouriteFilterConfiguration[] | undefined,
    mapTitle: string,
    ignoreErrors: boolean,
  ): FilterConfiguration[] {
    if (!attributeFilters) {
      return filterConfigurations;
    }

    this.validateAttributeFilters(attributeFilters, filterConfigurations, mapTitle, ignoreErrors);

    return filterConfigurations.map((filterConfiguration) => {
      const currentFilterConfiguration = attributeFilters.find(
        (attributeFilter) => attributeFilter.parameter === filterConfiguration.parameter,
      );
      return {
        ...filterConfiguration,
        filterValues: filterConfiguration.filterValues.map((filterValue) => {
          return {
            ...filterValue,
            isActive:
              currentFilterConfiguration?.activeFilters.find((activeFilter) => activeFilter.name === filterValue.name)?.isActive ?? false,
          };
        }),
      };
    });
  }

  private validateAttributeFilters(
    attributeFilters: FavouriteFilterConfiguration[],
    filterConfigs: FilterConfiguration[],
    mapTitle: string,
    ignoreErrors: boolean,
  ) {
    attributeFilters.forEach((attributeFilter) => {
      const matchingFilterConfiguration: FilterConfiguration | undefined = filterConfigs.find(
        (filterConfig) => filterConfig.parameter === attributeFilter.parameter,
      );
      if (!matchingFilterConfiguration) {
        if (!ignoreErrors) {
          throw new FavouriteIsInvalid(
            `Die Filterkonfiguration mit dem Parameter '${attributeFilter.name} (${attributeFilter.parameter})' existiert nicht mehr auf der Karte '${mapTitle}'.`,
          );
        }
      } else {
        attributeFilter.activeFilters.forEach((activeFilter) => {
          const activeFilterExists: boolean | undefined = matchingFilterConfiguration?.filterValues.some(
            (filterValue) => filterValue.name === activeFilter.name,
          );
          if (!activeFilterExists && !ignoreErrors) {
            throw new FavouriteIsInvalid(
              `Der Filter mit dem Namen '${activeFilter.name}' existiert nicht mehr in der Filterkonfiguration '${attributeFilter.name}' der Karte '${mapTitle}'.`,
            );
          }
        });
      }
    });

    filterConfigs.forEach((filterConfig) => {
      const matchingFavouriteFilterConfiguration: FavouriteFilterConfiguration | undefined = attributeFilters.find(
        (attributeFilter) => attributeFilter.parameter === filterConfig.parameter,
      );
      if (!matchingFavouriteFilterConfiguration) {
        if (!ignoreErrors) {
          throw new FavouriteIsInvalid(
            `Eine neue Filterkonfiguration mit dem Parameter '${filterConfig.name} (${filterConfig.parameter})' wurde zur Karte '${mapTitle}' hinzugefügt.`,
          );
        }
      } else {
        filterConfig.filterValues.forEach((filterValue) => {
          const newFilterValueHasBeenAdded: boolean | undefined = !matchingFavouriteFilterConfiguration?.activeFilters.some(
            (activeFilter) => activeFilter.name === filterValue.name,
          );
          if (newFilterValueHasBeenAdded && !ignoreErrors) {
            throw new FavouriteIsInvalid(
              `Ein neuer Filter mit dem Namen '${filterValue.name}' wurde zur Filterkonfiguration '${filterConfig.name}' der Karte '${mapTitle}' hinzugefügt.`,
            );
          }
        });
      }
    });
  }

  private validateTimeSlider(timeSliderConfiguration: TimeSliderConfiguration, timeExtent: TimeExtent): boolean {
    const isTimeExtentValid = this.timeSliderService.isTimeExtentValid(timeSliderConfiguration, timeExtent);
    switch (timeSliderConfiguration.sourceType) {
      case 'parameter':
        return isTimeExtentValid;
      case 'layer': {
        const selectedYearExists = (timeSliderConfiguration.source as TimeSliderLayerSource).layers.some(
          (layer) =>
            this.timeService.createUTCDateFromString(layer.date, timeSliderConfiguration.dateFormat).getTime() ===
            timeExtent.start.getTime(),
        );
        return selectedYearExists && isTimeExtentValid;
      }
    }
  }
}
