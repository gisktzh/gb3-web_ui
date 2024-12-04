import {ExternalApp} from '../interfaces/external-app.interface';

export const externalAppsData: ExternalApp[] = [
  {
    appUrl: 'https://lk.zh.ch ',
    department: 'ARE',
    image: {
      url: 'https://maps.zh.ch/system/docs/Stromnetzgebiete/leitungskataster_thumbnail.webp',
      altText: '',
    },
    title: 'Leitungskataster',
    email: 'leitungskataster@bd.zh.ch',
    keywords: ['Leitungskataster', 'Leitungssysteme', 'Versorgungsleitungen', 'Entsorgungsleitungen', 'Leitungen'],
    topic: 'Bauten',
    categories: ['Fachapplikationen'],
    visibility: 'both',
    description:
      'Der kantonale Leitungskataster bildet alle ober- und unterirdischen Versorgungs- und Entsorgungsleitungen der Medien Wasser, Abwasser, Elektrizität, Fernwärme, Gas und Kommunikation ab. Mit diesem Auskunftssystem lassen sich Projekte einfacher planen und koordinieren.',
  },
  {
    appUrl: 'https://web.maps.zh.ch/potree',
    department: 'ARE',
    image: {
      url: 'https://maps.zh.ch/system/docs/Stromnetzgebiete/potree_thumbnail.webp',
      altText: '',
    },
    title: 'Leitungskataster',
    email: 'ueli.mauch@bd.zh.ch',
    keywords: ['3D', 'Potree', 'lidar', 'Punktwolke', 'Höhen', 'Terrain', 'Basisdaten'],
    topic: 'Bauten',
    categories: ['WebMap', '3D', 'Visualisierung'],
    visibility: 'intranet',
    description:
      'Die LiDAR-Daten sind ein Teil der Basisprodukte der Geoinformation. Im GIS-Browser können bis anhin die abgeleiteten 2D-Produkte Terrainmodell und Oberflächenmodell visualisiert und bezogen werden. Der Potree Viewer bietet die Möglichkeit, in 3D durch die rohen Daten zu navigieren, einfache Messungen durchzuführen für weitere Analysen zu exportieren.',
  },
  {
    appUrl: 'https://maps.zh.ch/potree',
    department: 'ARE',
    image: {
      url: 'https://maps.zh.ch/system/docs/Stromnetzgebiete/potree_thumbnail.webp',
      altText: '',
    },
    title: 'Leitungskataster',
    email: 'ueli.mauch@bd.zh.ch',
    keywords: ['3D', 'Potree', 'lidar', 'Punktwolke', 'Höhen', 'Terrain', 'Basisdaten'],
    topic: 'Bauten',
    categories: ['WebMap', '3D', 'Visualisierung'],
    visibility: 'internet',
    description:
      'Die LiDAR-Daten sind ein Teil der Basisprodukte der Geoinformation. Im GIS-Browser können bis anhin die abgeleiteten 2D-Produkte Terrainmodell und Oberflächenmodell visualisiert und bezogen werden. Der Potree Viewer bietet die Möglichkeit, in 3D durch die rohen Daten zu navigieren, einfache Messungen durchzuführen für weitere Analysen zu exportieren.',
  },
];
