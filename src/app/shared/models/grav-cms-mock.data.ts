/* eslint-disable @typescript-eslint/naming-convention */
import {DiscoverMapsRoot, FrequentlyUsedRoot, PageInfosRoot} from './grav-cms-generated.interface';

export const discoverMapsMockData: DiscoverMapsRoot = {
  'discover-maps': [
    {
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Nulla posuere sollicitudin aliquam ultrices sagittis orci a scelerisque purus. Eleifend quam adipiscing vitae proin sagittis nisl rhoncus mattis rhoncus. Vulputate ut pharetra sit amet. Dolor sit amet consectetur adipiscing. Vulputate mi sit amet mauris commodo quis imperdiet. Rhoncus dolor purus non enim praesent elementum facilisis. Metus dictum at tempor commodo ullamcorper a. Aliquam sem fringilla ut morbi tincidunt augue interdum. Ornare arcu dui vivamus arcu felis bibendum ut tristique. Sodales ut etiam sit amet nisl purus in.',
      flex_id: 'de6494d67c0fa1c945bbfef15b3382ee',
      from_date: '01.01.2023',
      id: 'AVfarbigZH',
      image: {
        name: 'areupbackgroundzh.png',
        path: 'assets/imgages/basemaps/areupbackgroundzh.png',
        size: 106551,
        type: 'image/png'
      },
      title: 'AV Farbig',
      to_date: '31.12.2023'
    },
    {
      description:
        'Est ante in nibh mauris cursus mattis molestie a. Egestas diam in arcu cursus euismod. Volutpat blandit aliquam etiam erat velit scelerisque. Tincidunt id aliquet risus feugiat in ante metus dictum at. Mi quis hendrerit dolor magna eget est lorem. Sit amet consectetur adipiscing elit. Nunc scelerisque viverra mauris in aliquam sem fringilla. Velit euismod in pellentesque massa. Fames ac turpis egestas maecenas. Egestas dui id ornare arcu odio.',
      flex_id: '6bf8ffa31f0fea5eb6f0bb23ed5f10ec',
      from_date: '01.02.2023',
      id: 'OrthoZH',
      image: {
        name: 'aredtmbackgroundzh.png',
        path: 'assets/imgages/basemaps/aredtmbackgroundzh.png',
        size: 99094,
        type: 'image/png'
      },
      title: 'Höhenmodell',
      to_date: '31.10.2023'
    },
    {
      description:
        'Tempus egestas sed sed risus pretium quam vulputate. Scelerisque viverra mauris in aliquam. Integer feugiat scelerisque varius morbi enim nunc faucibus a pellentesque. Eleifend quam adipiscing vitae proin sagittis nisl. Mauris pharetra et ultrices neque ornare aenean. Dolor morbi non arcu risus quis varius quam quisque id. Lacinia quis vel eros donec ac. Id diam vel quam elementum pulvinar etiam non. A diam maecenas sed enim ut. Malesuada fames ac turpis egestas. Dignissim sodales ut eu sem integer vitae justo. Pharetra massa massa ultricies mi quis hendrerit dolor. Volutpat ac tincidunt vitae semper quis lectus nulla. Nibh cras pulvinar mattis nunc. Tincidunt praesent semper feugiat nibh sed pulvinar proin. Amet consectetur adipiscing elit ut. Enim diam vulputate ut pharetra sit amet. Sed vulputate mi sit amet mauris commodo quis imperdiet. Suspendisse potenti nullam ac tortor vitae purus faucibus ornare. Ac auctor augue mauris augue neque gravida in fermentum et.',
      flex_id: '380fb937bc57120dddbdc706dfd43b86',
      from_date: '01.03.2023',
      id: 'Lageklassen2019ZH',
      image: {
        name: 'arewildbackgroundzh.png',
        path: 'assets/imgages/basemaps/arewildbackgroundzh.png',
        size: 108516,
        type: 'image/png'
      },
      title: 'Lagerklassen',
      to_date: '31.08.2023'
    }
  ]
};

export const pageInfosMockData: PageInfosRoot = {
  'page-infos': [
    {
      description:
        'Morbi tristique senectus et netus. Quam pellentesque nec nam aliquam sem et tortor consequat id. Elit pellentesque habitant morbi tristique senectus et. Vitae justo eget magna fermentum iaculis eu non diam phasellus. Enim nunc faucibus a pellentesque sit amet porttitor. Quis vel eros donec ac odio tempor orci. Justo nec ultrices dui sapien eget mi proin. Donec adipiscing tristique risus nec. Elementum pulvinar etiam non quam lacus suspendisse faucibus interdum posuere. Rhoncus est pellentesque elit ullamcorper dignissim cras tincidunt lobortis feugiat. Pellentesque sit amet porttitor eget dolor morbi non arcu. Volutpat blandit aliquam etiam erat velit scelerisque in dictum non. Pharetra sit amet aliquam id. Habitasse platea dictumst quisque sagittis purus sit amet volutpat. Ut diam quam nulla porttitor massa. Nulla facilisi morbi tempus iaculis urna id volutpat lacus. Et malesuada fames ac turpis.',
      flex_id: '35026329a7a47bee67269b91c9af7e41',
      from_date: '01.01.2023',
      pages: {
        datacatalogue: true,
        map: false,
        start: false,
        support: false
      },
      severity: 'info',
      title: 'Diese Seite noch nicht fertig implementiert',
      to_date: '31.08.2023'
    },
    {
      description: 'Aktuell gibt es nicht genug Gurkenbröter und es kann zu einem Engpass kommen.',
      flex_id: '80a94be751b8f5255240a386a5564bca',
      from_date: '01.02.2023',
      pages: {
        datacatalogue: false,
        map: true,
        start: true,
        support: false
      },
      severity: 'warning',
      title: 'Gurkenbröter-Notfall',
      to_date: '31.07.2023'
    }
  ]
};

export const frequentlyUsedMockData: FrequentlyUsedRoot = {
  'frequently-used': [
    {
      created: '1685000932',
      description: 'Entzerrte und georeferenzierte digitale Luftbilder von verschiedenen Jahren und Jahreszeiten in TrueColor.',
      flex_id: 'ef0a1c679935ed064fdbd89245a80bf9',
      image: {
        name: 'aredtmbackgroundzh.png',
        path: 'assets/images/basemaps/aredtmbackgroundzh.png',
        size: 108482,
        type: 'image/png'
      },
      title: 'Orthofotos',
      url: 'http://localhost:4200/maps?initialMapIds=OrthoZH'
    },
    {
      created: '1684938059',
      description:
        'Lorem donec massa sapien faucibus et molestie ac. Ac tincidunt vitae semper quis. Ac ut consequat semper viverra nam. Aliquam etiam erat velit scelerisque in. Et odio pellentesque diam volutpat commodo sed egestas egestas fringilla. Amet justo donec enim diam vulputate ut pharetra sit. Nulla malesuada pellentesque elit eget gravida cum sociis natoque penatibus. Egestas diam in arcu cursus euismod quis. Non nisi est sit amet facilisis. Mauris pellentesque pulvinar pellentesque habitant morbi. Id neque aliquam vestibulum morbi blandit cursus risus.',
      flex_id: '4a368a8e51e9899d7f0fad0eb4c57893',
      image: null,
      title: 'Überarbeitete Höhenmodelle',
      url: 'https://de.wikipedia.org/wiki/Digitales_H%C3%B6henmodell'
    },
    {
      created: '1684938038',
      description:
        'Heute möchten wir die eher unbekannte Kirche Grossmünster vorstellen: Das Grossmünster ist eine romanische Kirche in der Altstadt von Zürich, erbaut zwischen 1100 und 1220. Die erste Altarweihe war 1104 für die Krypta und 1107 für den Chor. Die Schlussweihe erfolgte 1117 durch Erzbischof Bruno von Trier.',
      flex_id: '2077f02a1f274f82b7a73aed7b6a081c',
      image: {
        name: 'arelkbackgroundzh.png',
        path: 'assets/images/basemaps/arelkbackgroundzh.png',
        size: 133726,
        type: 'image/png'
      },
      title: 'Grossmünster'
    }
  ]
};
