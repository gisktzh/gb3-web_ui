import {RuntimeConfig} from '../../interfaces/runtime-config.interface';

/**
 * List of remote deployments which are used by the ConfigService to determine the correct URL configuration, dependent on the hostname.
 */
export const remoteDeployments: RuntimeConfig[] = [
  {
    hostMatch: 'staging.geo.ktzh.ch',
    apiBasePaths: {
      gb2Api: {
        baseUrl: 'https://uatmaps.kt.ktzh.ch'
      },
      gb2Wms: {
        baseUrl: 'https://uatwms.kt.ktzh.ch'
      },
      geoLion: {
        baseUrl: 'https://uatgeolion.kt.ktzh.ch'
      },
      searchApi: {
        baseUrl: 'https://gb3-search-api.icycliff-4b8f6c95.switzerlandnorth.azurecontainerapps.io'
      },
      ktzhWebsite: {
        baseUrl: 'https://www.zh.ch',
        enabled: true
      },
      gravCms: {
        baseUrl: 'https://gb3-grav-cms.icycliff-4b8f6c95.switzerlandnorth.azurecontainerapps.io',
        enabled: false
      },
      twitterWidget: {
        baseUrl: 'https://platform.twitter.com/widgets.js',
        enabled: false
      }
    },
    overrides: {}
  },
  {
    hostMatch: 'uat.geo.ktzh.ch',
    apiBasePaths: {
      gb2Api: {
        baseUrl: 'https://uatmaps.kt.ktzh.ch'
      },
      gb2Wms: {
        baseUrl: 'https://uatwms.kt.ktzh.ch'
      },
      geoLion: {
        baseUrl: 'https://uatgeolion.kt.ktzh.ch'
      },
      searchApi: {
        baseUrl: 'https://gb3-search-api.icycliff-4b8f6c95.switzerlandnorth.azurecontainerapps.io'
      },
      ktzhWebsite: {
        baseUrl: 'https://www.zh.ch',
        enabled: true
      },
      gravCms: {
        baseUrl: 'https://gb3-grav-cms.icycliff-4b8f6c95.switzerlandnorth.azurecontainerapps.io',
        enabled: false
      },
      twitterWidget: {
        baseUrl: 'https://platform.twitter.com/widgets.js',
        enabled: false
      }
    },
    overrides: {}
  },
  {
    hostMatch: 'geo.ktzh.ch',
    apiBasePaths: {
      gb2Api: {
        baseUrl: 'https://web.maps.zh.ch'
      },
      gb2Wms: {
        baseUrl: 'https://web.wms.zh.ch'
      },
      geoLion: {
        baseUrl: 'https://geolion.ktzh.ch'
      },
      searchApi: {
        baseUrl: 'https://gb3-search-api.icycliff-4b8f6c95.switzerlandnorth.azurecontainerapps.io'
      },
      ktzhWebsite: {
        baseUrl: 'https://www.zh.ch',
        enabled: true
      },
      gravCms: {
        baseUrl: 'https://gb3-grav-cms.icycliff-4b8f6c95.switzerlandnorth.azurecontainerapps.io',
        enabled: false
      },
      twitterWidget: {
        baseUrl: 'https://platform.twitter.com/widgets.js',
        enabled: false
      }
    },
    overrides: {}
  },
  {
    hostMatch: 'geo.zh.ch',
    apiBasePaths: {
      gb2Api: {
        baseUrl: 'https://maps.zh.ch'
      },
      gb2Wms: {
        baseUrl: 'https://wms.zh.ch'
      },
      geoLion: {
        baseUrl: 'https://geolion.zh.ch'
      },
      searchApi: {
        baseUrl: 'https://gb3-search-api.icycliff-4b8f6c95.switzerlandnorth.azurecontainerapps.io'
      },
      ktzhWebsite: {
        baseUrl: 'https://www.zh.ch',
        enabled: true
      },
      gravCms: {
        baseUrl: 'https://gb3-grav-cms.icycliff-4b8f6c95.switzerlandnorth.azurecontainerapps.io',
        enabled: false
      },
      twitterWidget: {
        baseUrl: 'https://platform.twitter.com/widgets.js',
        enabled: false
      }
    },
    overrides: {}
  },
  {
    hostMatch: 'calm-plant-0ecbec603.2.azurestaticapps.net',
    apiBasePaths: {
      gb2Api: {
        baseUrl: 'https://maps.zh.ch'
      },
      gb2Wms: {
        baseUrl: 'https://wms.zh.ch'
      },
      geoLion: {
        baseUrl: 'https://geolion.zh.ch'
      },
      searchApi: {
        baseUrl: 'https://gb3-search-api.icycliff-4b8f6c95.switzerlandnorth.azurecontainerapps.io'
      },
      ktzhWebsite: {
        baseUrl: 'https://www.zh.ch',
        enabled: true
      },
      gravCms: {
        baseUrl: 'https://gb3-grav-cms.icycliff-4b8f6c95.switzerlandnorth.azurecontainerapps.io',
        enabled: false
      },
      twitterWidget: {
        baseUrl: 'https://platform.twitter.com/widgets.js',
        enabled: false
      }
    },
    overrides: {}
  }
];
