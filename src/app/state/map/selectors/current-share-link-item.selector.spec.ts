import {InternalShareLinkItem} from 'src/app/shared/interfaces/internal-share-link.interface';
import {selectCurrentInternalShareLinkItem} from './current-share-link-item.selector';
import {ActiveMapItemConfiguration} from 'src/app/shared/interfaces/active-map-item-configuration.interface';
import {MapConfigState} from '../states/map-config.state';
import {Gb3StyledInternalDrawingRepresentation} from 'src/app/shared/interfaces/internal-drawing-representation.interface';

describe('selectCurrentInternalShareLinkItem', () => {
  it('should build an InternalShareLinkItem from selector inputs', () => {
    const activeMapItemConfigurations: ActiveMapItemConfiguration[] = [
      {
        id: '1234',
        mapId: 'yes',
        visible: true,
        isSingleLayer: false,
        opacity: 0.5,
        attributeFilters: undefined,
        timeExtent: undefined,
        layers: [],
      },
    ];

    const mapConfigState: MapConfigState = {
      center: {x: 10, y: 20},
      scale: 5000,
      isMapServiceInitialized: false,
      rotation: 0,
      srsId: 2056,
      ready: true,
      scaleSettings: {
        minScale: 1,
        maxScale: 10_000,
        calculatedMinScale: 1,
        calculatedMaxScale: 10_000,
      },
      isMaxZoomedIn: false,
      isMaxZoomedOut: false,
      activeBasemapId: 'yes',
      initialMaps: [],
      predefinedInitialExtent: false,
      initialMapPadding: {
        top: 1,
        right: 2,
        bottom: 3,
        left: 4,
      },
      initialMapPaddingMobile: {
        top: 1,
        right: 2,
        bottom: 3,
        left: 4,
      },
      initialBoundingBox: {
        min: {
          x: 1,
          y: 1,
        },
        max: {
          x: 10_000,
          y: 10_000,
        },
      },
      referenceDistanceInMeters: 2,
    };

    const activeBasemapId = 'basemap-123';

    const userDrawingsVectorLayers: {
      drawings: Gb3StyledInternalDrawingRepresentation[];
      measurements: Gb3StyledInternalDrawingRepresentation[];
    } = {
      drawings: [],
      measurements: [],
    };

    const result = selectCurrentInternalShareLinkItem.projector(
      activeMapItemConfigurations,
      mapConfigState,
      activeBasemapId,
      userDrawingsVectorLayers,
    );

    const expected: InternalShareLinkItem = {
      center: mapConfigState.center,
      scale: mapConfigState.scale,
      basemapId: activeBasemapId,
      content: activeMapItemConfigurations,
      ...userDrawingsVectorLayers,
    };

    expect(result).toEqual(expected);
  });
});
