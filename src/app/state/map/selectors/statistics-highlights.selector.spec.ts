import {StatisticsResult} from '../../../shared/interfaces/statistics.interface';
import {PointWithSrs} from '../../../shared/interfaces/geojson-types-with-srs.interface';
import {selectStatisticsHighlights} from './statistics-highlights.selector';

describe('selectStatisticsHighlights', () => {
  const point: PointWithSrs = {type: 'Point', srs: 2056, coordinates: [2680000, 1254000]};
  const other: PointWithSrs = {...point, coordinates: [2680100, 1254100]};
  const results: StatisticsResult[] = [
    {
      topic: 'StatBevoelkerungZH',
      title: 'Population',
      layers: [
        {layer: 'stat-bev-p', title: 'Population', columns: [], rows: [], status: 'ok', featureGeometry: point},
        {layer: 'no-geometry', title: 'Empty', columns: [], rows: [], status: 'noData'},
      ],
    },
    {
      topic: 'StatBeschaeftigteZH',
      title: 'Employment',
      layers: [{layer: 'stat-ent-p', title: 'Employment', columns: [], rows: [], status: 'ok', featureGeometry: other}],
    },
  ];

  it('marks only the explicitly selected layer rather than all returned geometries', () => {
    expect(
      selectStatisticsHighlights.projector(results, {topic: 'StatBevoelkerungZH', layer: 'stat-bev-p'}, 'statistics', true, true),
    ).toEqual({
      ready: true,
      queryMode: 'statistics',
      geometries: [point],
    });
    expect(
      selectStatisticsHighlights.projector(results, {topic: 'StatBeschaeftigteZH', layer: 'stat-ent-p'}, 'statistics', true, true)
        .geometries,
    ).toEqual([other]);
  });

  it('excludes cached statistics geometries while the feature tab is active', () => {
    expect(
      selectStatisticsHighlights.projector(results, {topic: 'StatBevoelkerungZH', layer: 'stat-bev-p'}, 'feature', true, true).geometries,
    ).toEqual([]);
  });

  it('does not mark results automatically or attempt to mark absent geometries', () => {
    expect(selectStatisticsHighlights.projector(results, undefined, 'statistics', true, true).geometries).toEqual([]);
    expect(
      selectStatisticsHighlights.projector(results, {topic: 'StatBevoelkerungZH', layer: 'no-geometry'}, 'statistics', true, true)
        .geometries,
    ).toEqual([]);
  });

  it.each([
    [false, false],
    [false, true],
    [true, false],
  ])('waits for both map readiness %s and initialization %s', (ready, initialized) => {
    expect(selectStatisticsHighlights.projector(results, undefined, 'statistics', ready, initialized).ready).toBe(false);
  });

  it('produces no markings for cleared or empty results', () => {
    expect(selectStatisticsHighlights.projector([], undefined, 'statistics', true, true).geometries).toEqual([]);
  });
});
