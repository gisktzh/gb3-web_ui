import {test as base, expect, type Page} from '@playwright/test';
import type {Store} from '@ngrx/store';
import type {
  Feature,
  General,
  OerebFeature,
  TopicsListData,
  TopicsStatisticInfoListData,
} from '../../src/app/shared/models/gb3-api-generated.interfaces';
import type {MapService} from '../../src/app/map/interfaces/map.service';
import type {QueryModeState} from '../../src/app/state/map/states/query-mode.state';
import type {ToolState} from '../../src/app/state/map/states/tool.state';
import type {MapConfigState} from '../../src/app/state/map/states/map-config.state';
import type {StatisticsState} from '../../src/app/state/map/states/statistics.state';
import {InternalDrawingLayer} from '../../src/app/shared/enums/drawing-layer.enum';

type Topic = TopicsListData['categories'][number]['topics'][number];
type BrowserState = {queryMode: QueryModeState; tool: ToolState; mapConfig: MapConfigState; statistics: StatisticsState};
type MapDebugComponent = {
  mapService: MapService & {store: Store<BrowserState>};
  mainMapRef: () => {nativeElement: HTMLDivElement};
};
type DebugWindow = Window & {ng?: {getComponent<T>(element: Element): T}};

function createTopic(topic: string, title: string, layer: string, id: number): Topic {
  return {
    topic,
    title,
    print_title: title,
    icon: '/images/statistics-test.png',
    organisation: null,
    geolion_gdd: null,
    geolion_karten_uuid: null,
    keywords: [],
    notice: null,
    timesliderConfiguration: null,
    filterConfigurations: null,
    searchConfigurations: null,
    wms_url: `https://maps.zh.ch/wms/${topic}`,
    gb2_url: null,
    opacity: 1,
    min_scale: null,
    layers: [
      {
        id,
        layer,
        title,
        geolion_gds: null,
        geolion_geodatensatz_uuid: null,
        group_title: null,
        min_scale: 1,
        max_scale: 1_000_000,
        wms_sort: 0,
        toc_sort: 0,
        initially_visible: true,
        queryable: true,
      },
    ],
  };
}

const topics: Topic[] = [
  createTopic('StatBeschaeftigteZH', 'Beschäftigtenstatistik', 'stat-ent-p', 900001),
  createTopic('StatBevoelkerungZH', 'Bevölkerungsstatistik', 'stat-bev-p', 900002),
  createTopic('StatGebaeudeZH', 'Gebäudestatistik', 'stat-geb-p', 900003),
  createTopic('KatOerebRaumplanungZH', 'ÖREB-Kataster', 'oereb-parcel', 900004),
];
const catalogue: TopicsListData = {categories: [{title: 'Test maps', topics}]};
const transparentImage = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jGf8AAAAASUVORK5CYII=',
  'base64',
);
const oereb: OerebFeature = {
  oereb_info: {
    municipality_name: 'Zürich',
    municipality_code: 261,
    parcel_number: '1234',
    egrid: 'CH000000000001',
    kbo: {title: 'Katasterstelle', href: '#'},
    surveyor: {title: 'Nachführungsstelle', href: '#'},
    static_extract_url: '#',
    concerned_themes: [],
    not_concerned_themes: [],
    not_available_themes: [],
  },
};

export interface StatisticsApi {
  statisticsQueries: URL[];
  featureQueries: URL[];
  emptyFeatures: boolean;
  openMap: (initialTopics?: string[]) => Promise<void>;
}

export const test = base.extend<{statisticsApi: StatisticsApi}>({
  statisticsApi: async ({page}, use) => {
    const api: StatisticsApi = {
      statisticsQueries: [],
      featureQueries: [],
      emptyFeatures: false,
      openMap: async (initialTopics = ['StatBeschaeftigteZH']) => {
        await page.goto(`/maps?initialMapIds=${initialTopics.join(',')}&x=2681876&y=1247142&scale=750`);
        await waitForMap(page);
        const map = page.locator('map-container');
        const bounds = await map.boundingBox();
        if (!bounds) throw new Error('The initialized map must have bounds.');
        await map.click({position: {x: bounds.width * 0.6, y: bounds.height * 0.4}});
        await expect(resultHost(page).locator('feature-info')).toContainText(
          api.emptyFeatures
            ? initialTopics.includes('KatOerebRaumplanungZH')
              ? 'CH000000000001'
              : 'Keine kartenspezifischen Treffer!'
            : `Feature for ${initialTopics[0]}`,
        );
      },
    };
    await page.routeFromHAR('e2e\\hars\\map-navigation.har', {
      url: /^https:\/\/(?!.*arcgis\.com).*$/,
      notFound: 'abort',
    });
    await page.route('**/wms/**', (route) => route.fulfill({contentType: 'image/png', body: transparentImage}));
    await page.route('https://maps.zh.ch/images/**', (route) => route.fulfill({contentType: 'image/png', body: transparentImage}));
    await page.route('**/gb3/v4/topics', (route) => route.fulfill({json: catalogue}));
    await page.route('**/gb3/v4/topics/*/legend?**', (route) => {
      const topic = new URL(route.request().url()).pathname.split('/').at(-2);
      return route.fulfill({json: {legend: {topic, geolion_gdd: null, geolion_karten_uuid: null, layers: []}}});
    });
    await page.route('**/gb3/v4/general_info?**', (route) => {
      const params = new URL(route.request().url()).searchParams;
      return route.fulfill({
        json: {
          general_info: {
            query_position: {x: Number(params.get('x')), y: Number(params.get('y')), srid: 2056},
            height_dom: 410,
            height_dtm: 400,
            spatial_references: [],
            external_maps: [],
            parcel: null,
          },
        } satisfies General,
      });
    });
    await page.route('**/gb3/v4/oereb?**', (route) => route.fulfill({json: oereb}));
    await page.route('**/gb3/v4/topics/*/feature_info?**', (route) => {
      const url = new URL(route.request().url());
      api.featureQueries.push(url);
      const topic = topics.find((entry) => entry.topic === url.pathname.split('/').at(-2));
      if (!topic) throw new Error(`Unknown fixture topic: ${url.pathname}`);
      const x = Number(url.searchParams.get('x'));
      const y = Number(url.searchParams.get('y'));
      return route.fulfill({
        json: {
          feature_info: {
            query_position: {x, y, srid: 2056},
            results: {
              topic: topic.topic,
              geolion_gdd: null,
              geolion_karten_uuid: null,
              report: {url: null, description: null},
              layers: api.emptyFeatures
                ? []
                : [
                    {
                      layer: topic.layers[0].layer,
                      title: topic.title,
                      features: [
                        {
                          fid: 1,
                          fields: [{label: 'Fixture attribute', type: 'text', value: `Feature for ${topic.topic}`}],
                          geometry: {
                            type: 'Polygon',
                            coordinates: [
                              [
                                [x - 10, y - 10],
                                [x + 10, y - 10],
                                [x + 10, y + 10],
                                [x - 10, y + 10],
                                [x - 10, y - 10],
                              ],
                            ],
                          },
                        },
                      ],
                    },
                  ],
            },
          },
        } satisfies Feature,
      });
    });
    await page.route('**/gb3/v4/topics/*/statistic_info?**', (route) => {
      const url = new URL(route.request().url());
      api.statisticsQueries.push(url);
      const topic = topics.find((entry) => entry.topic === url.pathname.split('/').at(-2));
      if (!topic) throw new Error(`Unknown fixture topic: ${url.pathname}`);
      expect(url.searchParams.get('field')).toBe(
        'ganzwhg,efh,wohn_m_n,geb_m_w,mfh,geb_o_w,prov_geb,andere_geb,anz_einw,anz_vzae,anz_besch',
      );
      expect(url.searchParams.get('statistic')).toBe('sum');
      const [first, second] = expectedStatisticsPoints(url);
      return route.fulfill({
        json: {
          statistic_info: {
            topic: topic.topic,
            topic_title: topic.title,
            geolion_karten_uuid: null,
            layer: topic.layers[0].layer,
            layer_title: topic.title,
            geolion_geodatensatz_uuid: null,
            fields: ['anz_besch', 'anz_vzae'],
            statistic: 'sum',
            geometry: url.searchParams.get('geometry')!,
            srid: Number(url.searchParams.get('srid')),
            feature_geometry: {
              type: 'GeometryCollection',
              geometries: [
                {type: 'Point', coordinates: first},
                {
                  type: 'GeometryCollection',
                  geometries: [
                    {type: 'Point', coordinates: second},
                    {type: 'Point', coordinates: first},
                  ],
                },
              ],
            },
            results: {
              anz_besch: {alias: 'Anzahl Beschäftigte', value: 42, count: 3},
              anz_vzae: {alias: 'Vollzeitäquivalente', value: 35.5, count: 3},
            },
          },
        } satisfies TopicsStatisticInfoListData,
      });
    });
    await use(api);
  },
});

export {expect};

export function resultHost(page: Page) {
  return page.locator((page.viewportSize()?.width ?? 1920) < 768 ? 'bottom-sheet-overlay' : 'feature-info-overlay');
}

export function expectedStatisticsPoints(url: URL): number[][] {
  const positions = Array.from((url.searchParams.get('geometry') ?? '').matchAll(/([-\d.e+]+)\s+([-\d.e+]+)/gi), ([, x, y]) => [
    Number(x),
    Number(y),
  ]);
  if (positions.length === 0) throw new Error('The query must contain a polygon.');
  const x = (Math.min(...positions.map(([x]) => x)) + Math.max(...positions.map(([x]) => x))) / 2;
  const y = (Math.min(...positions.map(([, y]) => y)) + Math.max(...positions.map(([, y]) => y))) / 2;
  return [
    [x - 20, y + 20],
    [x + 20, y - 20],
  ];
}

export async function waitForMap(page: Page) {
  await page.waitForFunction(() => {
    const element = document.querySelector('map-container');
    const angular = (window as DebugWindow).ng;
    if (!element || !angular) return false;
    const component = angular.getComponent<MapDebugComponent>(element);
    if (!component) return false;
    let ready = false;
    component.mapService.store
      .subscribe((state) => (ready = state.mapConfig.ready && state.mapConfig.isMapServiceInitialized))
      .unsubscribe();
    return ready;
  });
}

export async function readGraphics(page: Page, layer: InternalDrawingLayer) {
  return page.evaluate((layer) => {
    const element = document.querySelector('map-container');
    const angular = (window as DebugWindow).ng;
    if (!element || !angular) throw new Error('Angular map debug helpers must be available.');
    return angular
      .getComponent<MapDebugComponent>(element)
      .mapService.getInternalDrawingLayerGraphics(layer)
      .map(({geometry}) => geometry);
  }, layer);
}

export async function readInteraction(page: Page) {
  return page.evaluate(() => {
    const element = document.querySelector('map-container');
    const angular = (window as DebugWindow).ng;
    if (!element || !angular) throw new Error('Angular map debug helpers must be available.');
    let result: {mode: QueryModeState['queryMode']; activeTool: ToolState['activeTool']} | undefined;
    angular
      .getComponent<MapDebugComponent>(element)
      .mapService.store.subscribe(({queryMode, tool}) => (result = {mode: queryMode.queryMode, activeTool: tool.activeTool}))
      .unsubscribe();
    if (!result) throw new Error('The store must provide an interaction snapshot.');
    return result;
  });
}

export async function recreateMap(page: Page) {
  await page.evaluate(() => {
    const element = document.querySelector('map-container');
    const angular = (window as DebugWindow).ng;
    if (!element || !angular) throw new Error('Angular map debug helpers must be available.');
    const container = angular.getComponent<MapDebugComponent>(element);
    container.mapService.deInit();
    container.mapService.assignMapElement(container.mainMapRef().nativeElement);
  });
  await waitForMap(page);
}

export async function setMapScale(page: Page, scale: number) {
  await page.evaluate((scale) => {
    const element = document.querySelector('map-container');
    const angular = (window as DebugWindow).ng;
    if (!element || !angular) throw new Error('Angular map debug helpers must be available.');
    angular.getComponent<MapDebugComponent>(element).mapService.setScale(scale);
  }, scale);
  await expect
    .poll(() =>
      page.evaluate(() => {
        const element = document.querySelector('map-container');
        const angular = (window as DebugWindow).ng;
        if (!element || !angular) throw new Error('Angular map debug helpers must be available.');
        let scale = 0;
        angular
          .getComponent<MapDebugComponent>(element)
          .mapService.store.subscribe((state) => (scale = state.mapConfig.scale))
          .unsubscribe();
        return scale;
      }),
    )
    .toBeCloseTo(scale, 0);
}
