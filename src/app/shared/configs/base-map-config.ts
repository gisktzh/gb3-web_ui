interface BackgroundMapLayer {
  name: string;
}

interface BackgroundMap {
  url: string;
  title: string;
  srsId: number;
  layers: BackgroundMapLayer[];
}

export const defaultBackgroundMaps: BackgroundMap[] = [
  {
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
  },
  {
    url: 'https://maps.zh.ch/wms/AREDTMBackgroundZH',
    title: 'Digitales Terrainmodell',
    srsId: 2056,
    layers: [
      {
        name: 'dtm2017_relief'
      }
    ]
  },
  {
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
  }
];
