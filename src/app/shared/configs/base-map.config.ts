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
    title: 'Leer'
  },
  {
    id: 'aredtmbackgroundzh',
    type: 'wms',
    relativeImagePath: 'assets/images/basemaps/aredtmbackgroundzh.png',
    url: 'https://maps.zh.ch/wms/AREDTMBackgroundZH',
    title: 'Digitales Terrainmodell',
    srsId: 2056,
    layers: [
      {
        name: 'dtm2022_relief'
      }
    ]
  },
  {
    id: 'arewildbackgroundzh',
    type: 'wms',
    relativeImagePath: 'assets/images/basemaps/arewildbackgroundzh.png',
    url: 'https://maps.zh.ch/wms/AREWildBackgroundZH',
    title: 'Historische Karte J. Wild',
    srsId: 2056,
    layers: [
      {
        name: 'wild'
      }
    ]
  },
  {
    id: 'areupbackgroundzh',
    type: 'wms',
    relativeImagePath: 'assets/images/basemaps/areupbackgroundzh.png',
    url: 'https://maps.zh.ch/wms/AREUPBackgroundZH',
    title: 'Übersichtsplan',
    srsId: 2056,
    layers: [
      {
        name: 'lk500'
      },
      {
        name: 'lk200'
      },
      {
        name: 'lk100'
      },
      {
        name: 'lk50'
      },
      {
        name: 'lk25'
      },
      {
        name: 'grenzen'
      },
      {
        name: 'gemeindegrenzen'
      },
      {
        name: 'upnk_eisenbahn'
      },
      {
        name: 'upnk_hsfl'
      },
      {
        name: 'upzh_strassen'
      },
      {
        name: 'upzh_eisenbahn'
      },
      {
        name: 'upzh_einzelobjekte_l'
      },
      {
        name: 'upzh_befestigte_flaeche'
      },
      {
        name: 'upzh_unbefestigte_flaeche'
      },
      {
        name: 'upzh_gewaesser_l'
      },
      {
        name: 'upzh_vegetationslos'
      },
      {
        name: 'upzh_wald_p'
      },
      {
        name: 'upzh_waldgrenze'
      },
      {
        name: 'upnk_gebaeude'
      },
      {
        name: 'upnk_strassen'
      },
      {
        name: 'upnk_wald'
      },
      {
        name: 'upnk_gewaesser'
      },
      {
        name: 'upnk_befestigte_flaeche'
      },
      {
        name: 'upzh_fels_boeschung'
      },
      {
        name: 'upzh_gewaesser_f'
      },
      {
        name: 'upzh_gebaeude'
      },
      {
        name: 'upzh_weitere_gebaeude'
      },
      {
        name: 'upzh_weitereFlaechen'
      },
      {
        name: 'upzh_liegenschaften'
      },
      {
        name: 'Hoehenlinien'
      },
      {
        name: 'upzh_beschriftung'
      },
      {
        name: 'upnk_beschriftung'
      }
    ]
  },
  {
    id: 'arelkbackgroundzh',
    type: 'wms',
    relativeImagePath: 'assets/images/basemaps/arelkbackgroundzh.png',
    url: 'https://maps.zh.ch/wms/ARElkBackgroundZH',
    title: 'Landeskarte',
    srsId: 2056,
    layers: [
      {
        name: 'lk500'
      },
      {
        name: 'lk200'
      },
      {
        name: 'lk100'
      },
      {
        name: 'lk50'
      },
      {
        name: 'lk25'
      },
      {
        name: 'up8'
      },
      {
        name: 'up24'
      },
      {
        name: 'grenzen'
      },
      {
        name: 'gemeindegrenzen'
      }
    ]
  }
];

export const defaultBasemap = defaultBasemaps[4];
