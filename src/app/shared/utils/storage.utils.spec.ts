import {StorageUtils} from './storage.utils';

describe('StorageUtils', () => {
  describe('parseJson', () => {
    it(`parses a Json with valid Dates correctly`, () => {
      const shareLinkItemString =
        '{"center":{"x":2683131.5,"y":1247228},"scale":5374,"basemapId":"arelkbackgroundzh","content":[{"id":"StatGebAlterZH","mapId":"StatGebAlterZH","timeExtent":{"start":"1506-01-01T00:00:00.000Z","end":"1890-01-01T00:04:22.000Z"},"attributeFilters":[{"parameter":"FILTER_GEBART","name":"Anzeigeoptionen nach Hauptnutzung","activeFilters":[{"name":"Wohnen","isActive":false},{"name":"Gewerbe und Verwaltung","isActive":false},{"name":"Andere","isActive":false}]}]}]}';

      const shareLinkItem = {
        center: {x: 2683131.5, y: 1247228},
        scale: 5374,
        basemapId: 'arelkbackgroundzh',
        content: [
          {
            id: 'StatGebAlterZH',
            mapId: 'StatGebAlterZH',
            layers: [
              {id: 160331, layer: 'geb-alter_2', visible: true},
              {
                id: 160330,
                layer: 'geb-alter_grau',
                visible: false,
              },
              {id: 160329, layer: 'geb-alter_wohnen', visible: true},
            ],
            visible: true,
            opacity: 1,
            isSingleLayer: false,
            timeExtent: {start: '1506-01-01T00:00:00.000Z', end: '1890-01-01T00:04:22.000Z'},
            attributeFilters: [
              {
                parameter: 'FILTER_GEBART',
                name: 'Anzeigeoptionen nach Hauptnutzung',
                activeFilters: [
                  {name: 'Wohnen', isActive: false},
                  {
                    name: 'Gewerbe und Verwaltung',
                    isActive: false,
                  },
                  {name: 'Andere', isActive: false},
                ],
              },
            ],
          },
        ],
        drawings: {type: 'Vector', geojson: {type: 'FeatureCollection', features: []}, styles: {}},
        measurements: {type: 'Vector', geojson: {type: 'FeatureCollection', features: []}, styles: {}},
      };
      expect(StorageUtils.parseJson(shareLinkItemString)).toBe(shareLinkItem);
    });
  });
});
