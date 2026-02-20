import {AbstractLinksGroup} from '../interfaces/links-group.interface';

export const usefulInformationLinks: AbstractLinksGroup[] = [
  {
    label: 'Dokumentation',
    links: [
      {
        href: 'https://maps.zh.ch/api-docs/index.html',
        title: 'API Dokumentation GIS-Browser 3, GIS-ZH Schnittstellen',
      },
      {
        href: 'https://maps.zh.ch/api-docs/index.html?urls.primaryName=GB3%20Web%20UI%201.0.0',
        title: 'API Dokumentation URL Parameter',
      },
      {
        relativeUrl: '/api',
        title: 'API Dokumentation Geodatenkatalog',
        baseUrlType: 'geolion',
      },
      {
        href: 'https://maps.zh.ch/apidoc',
        title: 'API Dokumentation GIS-Browser 2, GIS-ZH Schnittstellen',
      },
      {
        href: 'https://maps.zh.ch/download/',
        title: 'Rasterdaten beziehen',
      },
      {
        href: 'https://www.zh.ch/content/dam/zhweb/bilder-dokumente/themen/planen-bauen/geoinformation/geodaten/geodatenshop/rest_schnittstelle_ogd_interface.pdf',
        title: 'Spezifikation REST-Schnittstelle',
      },
    ],
  },
  {
    label: 'Tools',
    links: [
      {
        href: 'https://www.swisstopo.admin.ch/de/karten-daten-online/calculation-services.html',
        title: 'Transformations- und Rechendienste Swisstopo',
      },
      {
        href: 'https://www.zh.ch/de/planen-bauen/geoinformation/geodaten/geodatenbezug/vorlagen-fuer-administrativer-grenzen-und-karten.html',
        title: 'Gemeinde-Kartentool',
      },
    ],
  },
  {
    label: 'Standards',
    links: [
      {
        href: 'https://www.interlis.ch/',
        title: 'Interlis',
      },
      {
        href: 'https://www.ogc.org/',
        title: 'Open Geospatial Consortium',
      },
    ],
  },
  {
    label: 'Weitere Daten',
    links: [
      {
        href: 'https://geodienste.ch/',
      },
      {
        href: 'https://www.zh.ch/de/politik-staat/statistik-daten/datenkatalog.html#/',
      },
      {
        href: 'https://opendata.swiss/de',
      },
    ],
  },
  {
    label: 'Das könnte Sie auch interessieren',
    links: [
      {
        href: 'https://www.zh.ch/de/planen-bauen/geoinformation.html',
        title: 'Themenseite der Geoinformation',
      },
      {
        href: 'https://map.geo.admin.ch/?lang=de',
        title: 'Kartenviewer des Bundes',
      },
      {
        href: 'https://www.cadastre.ch/de/home.html',
        title: 'Das schweizerische Katasterwesen',
      },
      {
        href: 'https://www.swisstopo.admin.ch/de/wissen-fakten/geodaesie-vermessung/bezugsysteme.html',
        title: 'Schweizerische Bezugssysteme',
      },
    ],
  },
];
