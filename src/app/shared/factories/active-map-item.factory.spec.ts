import {FilterConfiguration, Map, MapLayer} from '../interfaces/topic.interface';
import {ActiveMapItemFactory} from './active-map-item.factory';
import {Gb2WmsActiveMapItem} from '../../map/models/implementations/gb2-wms.model';
import {TimeExtent} from '../../map/interfaces/time-extent.interface';
import {DrawingLayer, DrawingLayerPrefix, InternalDrawingLayer, UserDrawingLayer} from '../enums/drawing-layer.enum';

type DrawingActiveMapItemConstructorArgs = {
  title: string;
  prefix: DrawingLayerPrefix;
  userDrawingLayer: DrawingLayer;
  visible?: boolean;
  opacity?: number;
};

describe('ActiveMapItemFactory', () => {
  describe('createTemporaryGb2WmsMapItem', () => {
    it('calls createGb2WmsMapItem with isTemporary set to true', () => {
      const map: Map = {} as Map;
      const layer: MapLayer = {} as MapLayer;
      const visible = true;
      const opacity = 0.42;
      const timeExtent = {} as TimeExtent;
      const attributeFilters = [] as FilterConfiguration[];

      const createGb2WmsMapItemSpy = vi.spyOn(ActiveMapItemFactory, 'createGb2WmsMapItem');

      ActiveMapItemFactory.createTemporaryGb2WmsMapItem(map, layer, visible, opacity, timeExtent, attributeFilters);

      expect(createGb2WmsMapItemSpy).toHaveBeenCalledWith(map, layer, visible, opacity, timeExtent, attributeFilters, true);
    });
  });

  describe('createGb2WmsMapItem', () => {
    it('should create a Gb2WmsActiveMapItem', () => {
      const map: Map = {} as Map;

      const result = ActiveMapItemFactory.createGb2WmsMapItem(map);

      expect(result).toBeInstanceOf(Gb2WmsActiveMapItem);
    });

    describe('opacity handling', () => {
      it('should use map opacity if not specified', () => {
        const map: Map = {opacity: 0.1337} as Map;

        const result = ActiveMapItemFactory.createGb2WmsMapItem(map);

        expect(result.opacity).toEqual(map.opacity);
      });

      it('should not use map opacity if opacity is specified', () => {
        const map: Map = {opacity: 0.1337} as Map;
        const opacity = 0.42;

        const result = ActiveMapItemFactory.createGb2WmsMapItem(map, undefined, undefined, opacity);

        expect(result.opacity).toEqual(opacity);
      });
    });

    describe('visibility handling', () => {
      it('should keep visibility for sublayers if a full map is added', () => {
        const layers: MapLayer[] = [{visible: false}, {visible: true}] as MapLayer[];
        const map: Map = {layers} as Map;

        const result = ActiveMapItemFactory.createGb2WmsMapItem(map);

        expect(result.settings.layers[0].visible).toEqual(layers[0].visible);
        expect(result.settings.layers[1].visible).toEqual(layers[1].visible);
      });

      it('should force visibility of single layer items to true', () => {
        const layers: MapLayer[] = [{visible: false}] as MapLayer[];
        const map: Map = {layers} as Map;

        const result = ActiveMapItemFactory.createGb2WmsMapItem(map, layers[0]);

        expect(result.settings.layers[0].visible).toEqual(true);
      });
    });
  });

  describe('create active map drawings', () => {
    it('should create a DrawingActiveMapItem with passed values and correct title', () => {
      const combos: (DrawingActiveMapItemConstructorArgs & {
        id: DrawingLayer;
      })[] = [
        {
          id: UserDrawingLayer.Drawings,
          userDrawingLayer: UserDrawingLayer.Drawings,
          title: 'Zeichnungen',
          prefix: DrawingLayerPrefix.Drawing,
          opacity: 0.1,
          visible: true,
        },
        {
          id: UserDrawingLayer.Measurements,
          userDrawingLayer: UserDrawingLayer.Measurements,
          title: 'Messungen',
          prefix: DrawingLayerPrefix.Drawing,
          opacity: 0.2,
          visible: false,
        },
        {
          id: InternalDrawingLayer.FeatureHighlight,
          userDrawingLayer: InternalDrawingLayer.FeatureHighlight,
          title: 'Feature Highlight',
          prefix: DrawingLayerPrefix.Internal,
          opacity: 0.3,
          visible: undefined,
        },
        {
          id: InternalDrawingLayer.FeatureQueryLocation,
          userDrawingLayer: InternalDrawingLayer.FeatureHighlight,
          title: 'Feature Query Location',
          prefix: DrawingLayerPrefix.Internal,
          opacity: 0.4,
          visible: true,
        },
        {
          id: InternalDrawingLayer.LocatePosition,
          userDrawingLayer: InternalDrawingLayer.LocatePosition,
          title: 'Locate Position',
          prefix: DrawingLayerPrefix.Internal,
          opacity: 0.5,
          visible: false,
        },
        {
          id: InternalDrawingLayer.PrintPreview,
          userDrawingLayer: InternalDrawingLayer.PrintPreview,
          title: 'Print Preview',
          prefix: DrawingLayerPrefix.Internal,
          opacity: 0.6,
          visible: undefined,
        },
        {
          id: InternalDrawingLayer.Selection,
          userDrawingLayer: InternalDrawingLayer.Selection,
          title: 'Selection',
          prefix: DrawingLayerPrefix.Internal,
          opacity: 0.7,
          visible: true,
        },
        {
          id: InternalDrawingLayer.ElevationProfile,
          userDrawingLayer: InternalDrawingLayer.ElevationProfile,
          title: 'Elevation Profiles',
          prefix: DrawingLayerPrefix.Internal,
          opacity: undefined,
          visible: false,
        },
        {
          id: InternalDrawingLayer.SearchResultHighlight,
          userDrawingLayer: InternalDrawingLayer.SearchResultHighlight,
          title: 'Search Result Highlight',
          prefix: DrawingLayerPrefix.Internal,
          opacity: undefined,
          visible: undefined,
        },
      ];

      combos.forEach((params) => {
        const result = ActiveMapItemFactory.createDrawingMapItem(params.id, params.prefix, params.visible, params.opacity);

        expect(result.title).toBe(params.title);
        expect(result.id).toBe(params.prefix + params.id);
        expect(result.opacity).toBe(params.opacity ?? 1);
        expect(result.visible).toBe(params.visible ?? true);
      });
    });
  });
});
