import {ShareLinkItem} from '../../shared/interfaces/share-link.interface';
import {MinimalGeometriesUtils} from './minimal-geometries.utils';
import {TimeExtentUtils} from '../../shared/utils/time-extent.utils';

export class ShareLinkItemTestUtils {
  public static createShareLinkItem(): ShareLinkItem {
    const {srs, ...minimalPolygonGeometry} = MinimalGeometriesUtils.getMinimalPolygon(2056);
    return {
      basemapId: 'arelkbackgroundzh',
      center: {x: 2675158, y: 1259964},
      scale: 18000,
      content: [
        {
          id: 'StatGebAlterZH',
          mapId: 'StatGebAlterZH',
          layers: [
            {
              id: 132494,
              layer: 'geb-alter_wohnen',
              visible: true,
            },
            {
              id: 132495,
              layer: 'geb-alter_grau',
              visible: false,
            },
            {
              id: 132496,
              layer: 'geb-alter_2',
              visible: true,
            },
          ],
          opacity: 0.5,
          visible: true,
          isSingleLayer: false,
          timeExtent: {start: TimeExtentUtils.parseDefaultUTCDate('1000'), end: TimeExtentUtils.parseDefaultUTCDate('2020')},
          attributeFilters: [
            {
              parameter: 'FILTER_GEBART',
              name: 'Anzeigeoptionen nach Hauptnutzung',
              activeFilters: [
                {name: 'Wohnen', isActive: false},
                {name: 'Andere', isActive: false},
                {
                  name: 'Gewerbe und Verwaltung',
                  isActive: false,
                },
              ],
            },
          ],
        },
        {
          id: 'Lageklassen2003ZH',
          mapId: 'Lageklassen2003ZH',
          layers: [
            {
              id: 135765,
              layer: 'lageklassen-2003-flaechen',
              visible: true,
            },
            {
              id: 135775,
              layer: 'lageklassen-2003-einzelobjekte',
              visible: true,
            },
          ],
          opacity: 1,
          visible: true,
          isSingleLayer: false,
          timeExtent: undefined,
          attributeFilters: undefined,
        },
      ],
      drawings: {
        type: 'Vector',
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: minimalPolygonGeometry,
              properties: {id: 'drawing_id', text: 'drawing', style: ''},
            },
          ],
        },
        styles: [],
      },
      measurements: {
        type: 'Vector',
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: minimalPolygonGeometry,
              properties: {id: 'measurement_id', text: 'measurement', style: ''},
            },
          ],
        },
        styles: [],
      },
    };
  }
}
