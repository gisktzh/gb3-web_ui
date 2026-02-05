import {InternalShareLinkItem} from 'src/app/shared/interfaces/internal-share-link.interface';
import {ShareLinkItem} from '../../shared/interfaces/share-link.interface';
import {MinimalGeometriesUtils} from './minimal-geometries.utils';
import {UserDrawingLayer} from 'src/app/shared/enums/drawing-layer.enum';

export class ShareLinkItemTestUtils {
  public static createShareLinkItemBase(timeExtentStart: Date, timeExtentEnd: Date) {
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
          timeExtent: {start: timeExtentStart, end: timeExtentEnd},
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
    };
  }

  public static createShareLinkItem(timeExtentStart: Date, timeExtentEnd: Date, mockStyleUuid: string): ShareLinkItem {
    const {srs: _, ...minimalPolygonGeometry} = MinimalGeometriesUtils.getMinimalPolygon(2056);
    return {
      ...ShareLinkItemTestUtils.createShareLinkItemBase(timeExtentStart, timeExtentEnd),
      drawings: {
        type: 'Vector',
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: minimalPolygonGeometry,
              properties: {id: 'drawing_id', text: 'drawing', style: mockStyleUuid, tool: 'point'},
            },
          ],
        },
        styles: {
          [mockStyleUuid]: {
            type: 'line',
            strokeColor: '',
            strokeOpacity: 0,
            strokeWidth: 0,
          },
        },
      },
      measurements: {
        type: 'Vector',
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: minimalPolygonGeometry,
              properties: {id: 'measurement_id', text: 'measurement', style: mockStyleUuid, tool: 'point'},
            },
          ],
        },
        styles: {
          [mockStyleUuid]: {
            type: 'line',
            strokeColor: '',
            strokeOpacity: 0,
            strokeWidth: 0,
          },
        },
      },
    };
  }

  public static createInternalShareLinkItem(timeExtentStart: Date, timeExtentEnd: Date): InternalShareLinkItem {
    const minimalGeometry = MinimalGeometriesUtils.getMinimalPolygon(2056);
    return {
      ...ShareLinkItemTestUtils.createShareLinkItemBase(timeExtentStart, timeExtentEnd),
      drawings: [
        {
          source: UserDrawingLayer.Drawings,
          type: 'Feature',
          geometry: minimalGeometry,
          labelText: 'drawing',
          properties: {
            // eslint-disable-next-line @typescript-eslint/naming-convention -- necessary because of type
            __id: 'drawing_id',
            // eslint-disable-next-line @typescript-eslint/naming-convention -- necessary because of type
            __tool: 'point',
            style: {
              type: 'line',
              strokeColor: '',
              strokeOpacity: 0,
              strokeWidth: 0,
            },
          },
        },
      ],
      measurements: [
        {
          source: UserDrawingLayer.Measurements,
          type: 'Feature',
          geometry: minimalGeometry,
          labelText: 'measurement',
          properties: {
            // eslint-disable-next-line @typescript-eslint/naming-convention -- necessary because of type
            __id: 'measurement_id',
            // eslint-disable-next-line @typescript-eslint/naming-convention -- necessary because of type
            __tool: 'point',
            style: {
              type: 'line',
              strokeColor: '',
              strokeOpacity: 0,
              strokeWidth: 0,
            },
          },
        },
      ],
    };
  }
}
