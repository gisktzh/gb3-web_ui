import {Basemap} from '../interfaces/basemap.interface';
import {MapConstants} from '../constants/map.constants';

/**
 * A list of all available basemaps.
 * The order matters: the first item in this list will be shown on the left-hand side of the basemap widget.
 */
export const defaultBasemaps: Basemap[] = [
  {
    id: `${MapConstants.INTERNAL_LAYER_PREFIX}blank`,
    type: 'blank',
    title: 'Kein Hintergrund',
  },
  {
    id: 'areosmbackgroundzh',
    type: 'wms',
    relativeImagePath: 'assets/images/basemaps/areosmbackgroundzh.png',
    url: 'https://maps.zh.ch/wms/AREOSMBackgroundZH',
    title: 'Situationsplan',
    srsId: 2056,
    layers: [
      {
        name: 'osm_mundial_terrestris',
      },
      {
        name: 'ch_osm_buildings',
      },
      {
        name: 'ch_osm_highways',
      },
      {
        name: 'ch_osm_landuse',
      },
      {
        name: 'grenzen',
      },
      {
        name: 'gemeindegrenzen',
      },
    ],
  },
  {
    id: 'areavbackgroundzh',
    type: 'wms',
    relativeImagePath: 'assets/images/basemaps/areavbackgroundzh.png',
    url: 'https://maps.zh.ch/wms/AREAVBackgroundZH',
    title: 'Amtliche Vermessung',
    srsId: 2056,
    layers: [
      {
        name: 'wald',
      },
      {
        name: 'seen',
      },
      {
        name: 'grenzen',
      },
      {
        name: 'gemeindegrenzen',
      },
      {
        name: 'lk500',
      },
      {
        name: 'lk200',
      },
      {
        name: 'lk100',
      },
      {
        name: 'lk50',
      },
      {
        name: 'lk25',
      },
      {
        name: 'LCSF',
      },
      {
        name: 'SOSF',
      },
      {
        name: 'SOLI',
      },
      {
        name: 'LOCPOS',
      },
      {
        name: 'HADR',
      },
      {
        name: 'LNNA',
      },
      {
        name: 'LNNA_Ortsname',
      },
      {
        name: 'OSNR_liegenschaften',
      },
      {
        name: 'RESF',
      },
      {
        name: 'MBSF',
      },
      {
        name: 'TBLI',
      },
      {
        name: 'OSBP',
      },
      {
        name: 'TBBP',
      },
    ],
  },
  {
    id: 'aredtmbackgroundzh',
    type: 'wms',
    relativeImagePath: 'assets/images/basemaps/aredtmbackgroundzh.png',
    url: 'https://maps.zh.ch/wms/AREDTMBackgroundZH',
    title: 'Gelände',
    srsId: 2056,
    layers: [
      {
        name: 'dtm_swisstopo',
      },
      {
        name: 'dtm_zh_aktuell',
      },
      {
        name: 'grenzen',
      },
      {
        name: 'gemeindegrenzen',
      },
    ],
  },
  {
    id: 'areorthobackgroundzh',
    type: 'wms',
    relativeImagePath: 'assets/images/basemaps/areorthobackgroundzh.png',
    url: 'https://maps.zh.ch/wms/AREOrthoBackgroundZH',
    title: 'Luftbild',
    srsId: 2056,
    layers: [
      {
        name: 'ortho_swisstopo',
      },
      {
        name: 'ortho_zh_aktuell',
      },
      {
        name: 'grenzen',
      },
      {
        name: 'gemeindegrenzen',
      },
    ],
  },
  {
    id: 'arewildbackgroundzh',
    type: 'wms',
    relativeImagePath: 'assets/images/basemaps/arewildbackgroundzh.png',
    url: 'https://maps.zh.ch/wms/AREWildBackgroundZH',
    title: 'Historische Karte J. Wild (~1850)',
    srsId: 2056,
    layers: [
      {
        name: 'wild',
      },
    ],
  },
  {
    id: 'arelkbackgroundzh',
    type: 'wms',
    relativeImagePath: 'assets/images/basemaps/arelkbackgroundzh.png',
    url: 'https://maps.zh.ch/wms/ARElkBackgroundZH',
    title: 'Basiskarte',
    srsId: 2056,
    layers: [
      {
        name: 'wald',
      },
      {
        name: 'seen',
      },
      {
        name: 'grenzen',
      },
      {
        name: 'gemeindegrenzen',
      },
      {
        name: 'lk500',
      },
      {
        name: 'lk200',
      },
      {
        name: 'lk100',
      },
      {
        name: 'lk50',
      },
      {
        name: 'lk25',
      },
      {
        name: 'up8',
      },
      {
        name: 'up24',
      },
    ],
  },
];

export const defaultBasemap = defaultBasemaps[6];
