import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';
import {Map, MapLayer} from '../../../shared/interfaces/topic.interface';
import {DrawingActiveMapItem} from '../../../map/models/implementations/drawing.model';
import {ActiveMapItem} from '../../../map/models/active-map-item.model';
import {selectQueryLegends} from './query-legends.selector';
import {QueryLegend} from '../../../shared/interfaces/query-legend.interface';

describe('selectQueryLegends', () => {
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
  it('returns all visible topics with undefined as layername for non-singles', () => {
    const actual = selectQueryLegends.projector(basicMockState);

    const expected: QueryLegend[] = [
      {topic: basicMockState[0].id, layer: undefined},
      {topic: basicMockState[1].id, layer: undefined},
    ];
    expect(actual).toEqual(expected);
  });

  it('returns all visible topics with layerId if singlelayer', () => {
    const layerId = 'test-single';
    const mapId = 'map-with-singles';
    const singleLayerItem = new Gb2WmsActiveMapItem(
      {id: mapId} as Map,
      {layer: layerId, title: 'ALL THE SINGLE LAYERS; ALL THE SINGLE LAYERS /o/'} as MapLayer,
    );

    const actual = selectQueryLegends.projector([singleLayerItem]);

    const expected: QueryLegend[] = [{topic: mapId, layer: layerId}];
    expect(actual).toEqual(expected);
  });

  it('does not return an invisible element', () => {
    basicMockState[0].visible = false;

    const actual = selectQueryLegends.projector(basicMockState);

    const expected: QueryLegend[] = [{topic: basicMockState[1].id, layer: undefined}];
    expect(actual).toEqual(expected);
  });

  it('returns an empty string if no layers are active', () => {
    basicMockState[0].visible = false;
    basicMockState[1].visible = false;

    const actual = selectQueryLegends.projector(basicMockState);

    const expected: QueryLegend[] = [];
    expect(actual).toEqual(expected);
  });

  it('does not return layers other than Gb2WmsActiveMapItem', () => {
    const drawingLayer = new DrawingActiveMapItem('', '');
    (basicMockState as ActiveMapItem[]).push(drawingLayer);

    const actual = selectQueryLegends.projector(basicMockState);

    const expected: QueryLegend[] = [
      {topic: basicMockState[0].id, layer: undefined},
      {topic: basicMockState[1].id, layer: undefined},
    ];

    expect(actual.length).toEqual(2);
    expect(actual).toEqual(expected);
  });
});
