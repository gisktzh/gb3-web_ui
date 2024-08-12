import {selectQueryLayers} from './query-layers.selector';
import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';
import {Map} from '../../../shared/interfaces/topic.interface';
import {DrawingActiveMapItem} from '../../../map/models/implementations/drawing.model';
import {ActiveMapItem} from '../../../map/models/active-map-item.model';
import {QueryTopic} from '../../../shared/interfaces/query-topic.interface';
import {DrawingLayerPrefix, UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';

describe('selectQueryLayers', () => {
  let mockItems: Gb2WmsActiveMapItem[];
  let mockScale = 0;

  beforeEach(() => {
    /**
     * Basic mock state containing two map items with two sublayers each; and all are visible
     */
    mockItems = [
      new Gb2WmsActiveMapItem({
        id: 'test-map1',
        layers: [
          {layer: 'layer-1', visible: true, queryable: true, minScale: 50, maxScale: 10000},
          {layer: 'layer-2', visible: true, queryable: true, minScale: 100, maxScale: 11000},
        ],
      } as Map),
      new Gb2WmsActiveMapItem({
        id: 'test-map2',
        layers: [
          {layer: 'layer-a', visible: true, queryable: true, minScale: 1, maxScale: 1500000},
          {layer: 'layer-b', visible: true, queryable: true, minScale: 1, maxScale: 1500000},
        ],
      } as Map),
    ];
    mockScale = 1000;
  });

  it('returns all visible topic IDs with all visible and queryable sublayer IDs (joined with ,) as QueryTopic list', () => {
    const actual = selectQueryLayers.projector(mockItems, mockScale, false);

    const expected: QueryTopic[] = [
      {
        topic: mockItems[0].id,
        layersToQuery: mockItems[0].settings.layers.map((l) => l.layer).join(','),
        isSingleLayer: false,
      },
      {
        topic: mockItems[1].id,
        layersToQuery: mockItems[1].settings.layers.map((l) => l.layer).join(','),
        isSingleLayer: false,
      },
    ];
    expect(actual).toEqual(expected);
  });

  it('does not return an invisible topic regardless of sublayer state', () => {
    mockItems[0].visible = false;

    const actual = selectQueryLayers.projector(mockItems, mockScale, false);

    const expected: QueryTopic[] = [
      {
        topic: mockItems[1].id,
        layersToQuery: mockItems[1].settings.layers.map((l) => l.layer).join(','),
        isSingleLayer: false,
      },
    ];
    expect(actual).toEqual(expected);
  });

  it('does not return an invisible sublayer', () => {
    mockItems[0].settings.layers[0].visible = false;

    const actual = selectQueryLayers.projector(mockItems, mockScale, false);

    const expected: QueryTopic[] = [
      {topic: mockItems[0].id, layersToQuery: mockItems[0].settings.layers[1].layer, isSingleLayer: false},
      {
        topic: mockItems[1].id,
        layersToQuery: mockItems[1].settings.layers.map((l) => l.layer).join(','),
        isSingleLayer: false,
      },
    ];
    expect(actual).toEqual(expected);
  });

  it('does not return an unqueryable sublayer', () => {
    mockItems[0].settings.layers[0].queryable = false;

    const actual = selectQueryLayers.projector(mockItems, mockScale, false);

    const expected: QueryTopic[] = [
      {topic: mockItems[0].id, layersToQuery: mockItems[0].settings.layers[1].layer, isSingleLayer: false},
      {
        topic: mockItems[1].id,
        layersToQuery: mockItems[1].settings.layers.map((l) => l.layer).join(','),
        isSingleLayer: false,
      },
    ];
    expect(actual).toEqual(expected);
  });

  it('does not return a topic if all sublayers are unqueryable', () => {
    mockItems[0].settings.layers[0].queryable = false;
    mockItems[0].settings.layers[1].queryable = false;

    const actual = selectQueryLayers.projector(mockItems, mockScale, false);

    const expected: QueryTopic[] = [
      {
        topic: mockItems[1].id,
        layersToQuery: mockItems[1].settings.layers.map((l) => l.layer).join(','),
        isSingleLayer: false,
      },
    ];
    expect(actual).toEqual(expected);
  });

  it('does not return a topic if all sublayers are invisible', () => {
    mockItems[0].settings.layers[0].visible = false;
    mockItems[0].settings.layers[1].visible = false;

    const actual = selectQueryLayers.projector(mockItems, mockScale, false);

    const expected: QueryTopic[] = [
      {
        topic: mockItems[1].id,
        layersToQuery: mockItems[1].settings.layers.map((l) => l.layer).join(','),
        isSingleLayer: false,
      },
    ];
    expect(actual).toEqual(expected);
  });

  it('does not return layers other than Gb2WmsActiveMapItem', () => {
    const drawingLayer = new DrawingActiveMapItem('', DrawingLayerPrefix.Drawing, UserDrawingLayer.Measurements);
    (mockItems as ActiveMapItem[]).push(drawingLayer);

    const actual = selectQueryLayers.projector(mockItems, mockScale, false);

    const expected: QueryTopic[] = [
      {
        topic: mockItems[0].id,
        layersToQuery: mockItems[0].settings.layers.map((l) => l.layer).join(','),
        isSingleLayer: false,
      },
      {
        topic: mockItems[1].id,
        layersToQuery: mockItems[1].settings.layers.map((l) => l.layer).join(','),
        isSingleLayer: false,
      },
    ];

    expect(actual.length).toEqual(2);
    expect(actual).toEqual(expected);
  });

  it('does not return layers if the current scale is smaller than the minScale of the layer', () => {
    mockScale = 99;

    const actual = selectQueryLayers.projector(mockItems, mockScale, false);

    const expected: QueryTopic[] = [
      {topic: mockItems[0].id, layersToQuery: mockItems[0].settings.layers[0].layer, isSingleLayer: false},
      {
        topic: mockItems[1].id,
        layersToQuery: mockItems[1].settings.layers.map((l) => l.layer).join(','),
        isSingleLayer: false,
      },
    ];
    expect(actual).toEqual(expected);
  });

  it('does not return layers if the current scale is larger than the maxScale of the layer', () => {
    mockScale = 10001;

    const actual = selectQueryLayers.projector(mockItems, mockScale, false);

    const expected: QueryTopic[] = [
      {topic: mockItems[0].id, layersToQuery: mockItems[0].settings.layers[1].layer, isSingleLayer: false},
      {
        topic: mockItems[1].id,
        layersToQuery: mockItems[1].settings.layers.map((l) => l.layer).join(','),
        isSingleLayer: false,
      },
    ];
    expect(actual).toEqual(expected);
  });

  it('does not return a topic if all sublayers are not visible due to small scale', () => {
    mockScale = 49;

    const actual = selectQueryLayers.projector(mockItems, mockScale, false);

    const expected: QueryTopic[] = [
      {
        topic: mockItems[1].id,
        layersToQuery: mockItems[1].settings.layers.map((l) => l.layer).join(','),
        isSingleLayer: false,
      },
    ];
    expect(actual).toEqual(expected);
  });

  it('does not return a topic if all sublayers are not visible due to large scale', () => {
    mockScale = 11001;

    const actual = selectQueryLayers.projector(mockItems, mockScale, false);

    const expected: QueryTopic[] = [
      {
        topic: mockItems[1].id,
        layersToQuery: mockItems[1].settings.layers.map((l) => l.layer).join(','),
        isSingleLayer: false,
      },
    ];
    expect(actual).toEqual(expected);
  });

  it('returns all layers and sublayers independent from the scale or visibility if the `devMode` is true', () => {
    const actual = selectQueryLayers.projector(mockItems, mockScale, true);

    const expected: QueryTopic[] = [
      {
        topic: mockItems[0].id,
        layersToQuery: mockItems[0].settings.layers.map((l) => l.layer).join(','),
        isSingleLayer: false,
      },
      {
        topic: mockItems[1].id,
        layersToQuery: mockItems[1].settings.layers.map((l) => l.layer).join(','),
        isSingleLayer: false,
      },
    ];
    expect(actual).toEqual(expected);
  });
});
