import {selectQueryLayers} from './query-layers.selector';
import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';
import {Map} from '../../../shared/interfaces/topic.interface';
import {QueryLayer} from '../../../shared/interfaces/query-layer.interface';
import {DrawingActiveMapItem} from '../../../map/models/implementations/drawing.model';
import {ActiveMapItem} from '../../../map/models/active-map-item.model';

describe('selectQueryLayers', () => {
  let basicMockState: Gb2WmsActiveMapItem[];
  beforeEach(() => {
    /**
     * Basic mock state containing two map items with two sublayers each; and all are visible
     */
    basicMockState = [
      new Gb2WmsActiveMapItem({
        id: 'test-map1',
        layers: [
          {layer: 'layer-1', visible: true, queryable: true},
          {layer: 'layer-2', visible: true, queryable: true},
        ],
      } as Map),
      new Gb2WmsActiveMapItem({
        id: 'test-map2',
        layers: [
          {layer: 'layer-a', visible: true, queryable: true},
          {layer: 'layer-b', visible: true, queryable: true},
        ],
      } as Map),
    ];
  });
  it('returns all visible topic IDs with all visible and queryable sublayer IDs (joined with ,) as QueryLayer list', () => {
    const actual = selectQueryLayers.projector(basicMockState);

    const expected: QueryLayer[] = [
      {topic: basicMockState[0].id, layersToQuery: basicMockState[0].settings.layers.map((l) => l.layer).join(',')},
      {topic: basicMockState[1].id, layersToQuery: basicMockState[1].settings.layers.map((l) => l.layer).join(',')},
    ];
    expect(actual).toEqual(expected);
  });

  it('does not return an invisible topic regardless of sublayer state', () => {
    basicMockState[0].visible = false;

    const actual = selectQueryLayers.projector(basicMockState);

    const expected: QueryLayer[] = [
      {topic: basicMockState[1].id, layersToQuery: basicMockState[1].settings.layers.map((l) => l.layer).join(',')},
    ];
    expect(actual).toEqual(expected);
  });

  it('does not return an invisible sublayer', () => {
    basicMockState[0].settings.layers[0].visible = false;

    const actual = selectQueryLayers.projector(basicMockState);

    const expected: QueryLayer[] = [
      {topic: basicMockState[0].id, layersToQuery: basicMockState[0].settings.layers[1].layer},
      {topic: basicMockState[1].id, layersToQuery: basicMockState[1].settings.layers.map((l) => l.layer).join(',')},
    ];
    expect(actual).toEqual(expected);
  });

  it('does not return an unqueryable sublayer', () => {
    basicMockState[0].settings.layers[0].queryable = false;

    const actual = selectQueryLayers.projector(basicMockState);

    const expected: QueryLayer[] = [
      {topic: basicMockState[0].id, layersToQuery: basicMockState[0].settings.layers[1].layer},
      {topic: basicMockState[1].id, layersToQuery: basicMockState[1].settings.layers.map((l) => l.layer).join(',')},
    ];
    expect(actual).toEqual(expected);
  });

  it('returns an empty string if all sublayers are unqueryable', () => {
    basicMockState[0].settings.layers[0].queryable = false;
    basicMockState[0].settings.layers[1].queryable = false;

    const actual = selectQueryLayers.projector(basicMockState);

    const expected: QueryLayer[] = [
      {topic: basicMockState[0].id, layersToQuery: ''},
      {topic: basicMockState[1].id, layersToQuery: basicMockState[1].settings.layers.map((l) => l.layer).join(',')},
    ];
    expect(actual).toEqual(expected);
  });

  it('returns an empty string if all sublayers are invisible', () => {
    basicMockState[0].settings.layers[0].visible = false;
    basicMockState[0].settings.layers[1].visible = false;

    const actual = selectQueryLayers.projector(basicMockState);

    const expected: QueryLayer[] = [
      {topic: basicMockState[0].id, layersToQuery: ''},
      {topic: basicMockState[1].id, layersToQuery: basicMockState[1].settings.layers.map((l) => l.layer).join(',')},
    ];
    expect(actual).toEqual(expected);
  });

  it('does not return layers other than Gb2WmsActiveMapItem', () => {
    const drawingLayer = new DrawingActiveMapItem('', '');
    (basicMockState as ActiveMapItem[]).push(drawingLayer);

    const actual = selectQueryLayers.projector(basicMockState);

    const expected: QueryLayer[] = [
      {topic: basicMockState[0].id, layersToQuery: basicMockState[0].settings.layers.map((l) => l.layer).join(',')},
      {topic: basicMockState[1].id, layersToQuery: basicMockState[1].settings.layers.map((l) => l.layer).join(',')},
    ];

    expect(actual.length).toEqual(2);
    expect(actual).toEqual(expected);
  });
});
