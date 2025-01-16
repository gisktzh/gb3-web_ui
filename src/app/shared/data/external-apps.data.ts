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
    appUrl: 'https://portal.ebaugesuche.zh.ch/ ',
    department: 'ARE',
    image: {
      url: 'https://cataas.com/cat?width=500&height=250',
      altText: '',
    },
    title: 'eBaugesuche',
    email: 'datenlogistik@bd.zh.ch',
    keywords: ['Baueingabe', 'Baugesuche', 'Bauprojekte', 'Baubewilligungen'],
    topic: 'Bauten',
    categories: ['Fachapplikationen', 'Erfassungstool'],
    visibility: 'both',
    description:
      'Die Plattform «eBaugesucheZH» ermöglicht die vollständig elektronische Abwicklung des Baubewilligungsverfahrens von der Eingabe des Baugesuchs über die Prüfung, Bewilligung bis zur Abnahme des Bauvorhabens. Viele Gemeinden bieten diesen Online-Service bereits an.',
  },
  {
    appUrl: 'https://web.maps.zh.ch/potree',
    department: 'ARE',
    image: {
      url: 'https://maps.zh.ch/system/docs/Stromnetzgebiete/potree_thumbnail.webp',
      altText: '',
    },
    title: 'Potree LiDAR Viewer',
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
    title: 'Potree LiDAR Viewer',
    email: 'ueli.mauch@bd.zh.ch',
    keywords: ['3D', 'Potree', 'lidar', 'Punktwolke', 'Höhen', 'Terrain', 'Basisdaten'],
    topic: 'Bauten',
    categories: ['WebMap', '3D', 'Visualisierung'],
    visibility: 'internet',
    description:
      'Die LiDAR-Daten sind ein Teil der Basisprodukte der Geoinformation. Im GIS-Browser können bis anhin die abgeleiteten 2D-Produkte Terrainmodell und Oberflächenmodell visualisiert und bezogen werden. Der Potree Viewer bietet die Möglichkeit, in 3D durch die rohen Daten zu navigieren, einfache Messungen durchzuführen für weitere Analysen zu exportieren.',
  },
  {
    appUrl: 'https://web.maps.zh.ch/apps/elm/tba/videoStrassenraumZH.html?easting=2678552.42&northing=1254281.63&map=true',
    department: 'TBA',
    image: {
      url: 'https://cataas.com/cat?width=500&height=250',
      altText: '',
    },
    title: '3D Strassenraum für Kantonsstrassen',
    email: 'stevan.skeledzic@bd.zh.ch',
    keywords: ['Staatsstrassen', '3-D Messen', 'Strasseninfrastruktur'],
    topic: 'Verkehr',
    categories: ['Visualisierung', '3D'],
    visibility: 'intranet',
    description: 'Kartierung-, Visualisierungs- und Analysetool für Staatsstrassen des Kantons Zürich.',
  },
  {
    appUrl: 'https://vdp.zh.ch/',
    department: 'TBA',
    image: {
      url: 'https://cataas.com/cat?width=500&height=250',
      altText: '',
    },
    title: 'Veloverkehr Online',
    email: 'tba.vo@bd.zh.ch',
    keywords: ['Verkehrsmessstellen', 'Verkehrsaufkommen', 'Messstellen'],
    topic: 'Verkehr',
    categories: ['WebMap', 'Fachapplikationen', 'Dashboard'],
    visibility: 'both',
    description:
      'Die mit Hilfe der Verkehrsmessstellen gewonnenen Daten bilden die Grundlage für die verschiedensten Verkehrsauskünfte. Sie dienen dem kantonalen Verkehrsmodell (KVM-ZH), dem Lärmkataster, gestützt auf die Lärmschutzverordnung (LSV) und die Luftreinhalteverordnung (LRV), sowie internen und externen Verkehrsauskünften.',
  },
  {
    appUrl: 'https://hydroproweb.zh.ch/Karten/A4%20Wassertemperaturen/Wassertemp.html',
    department: 'AWEL',
    image: {
      url: 'https://cataas.com/cat?width=500&height=250',
      altText: '',
    },
    title: 'Wassertemperaturen der Oberflächengewässern',
    email: 'hydrometrie@bd.zh.ch',
    keywords: ['Wassertemperatur', 'Limmat', 'Sihl', 'Zürichsee', 'Temperatur'],
    topic: 'Wasser',
    categories: ['WebMap', 'Visualisierung'],
    visibility: 'both',
    description:
      'Die Daten geben Auskunft über die aktuellen und historischen Messwerte der hydrometrischen Stationen an Oberflächengewässern.',
  },
  {
    appUrl: 'https://wl62www41.webland.ch/tensiometer_cms/tensiometerwerte.php',
    department: 'ALN',
    image: {
      url: 'https://cataas.com/cat?width=500&height=250',
      altText: '',
    },
    title: 'Bodenfeuchte',
    email: 'reto.mani@bd.zh.ch',
    keywords: ['Bodenfeuchte', 'Saugspannungsbereich'],
    topic: 'Boden',
    categories: ['WebMap', 'Visualisierung', 'Fachapplikationen'],
    visibility: 'both',
    description:
      'Das Messnetz liefert aktuelle Messdaten zur Bodenfeuchte und Informationen zur schonenden und nachhaltigen Nutzung unserer Böden.',
  },
  {
    appUrl: 'https://openzh.shinyapps.io/Lokalklima/',
    department: 'STAT',
    image: {
      url: 'https://cataas.com/cat?width=500&height=250',
      altText: '',
    },
    title: 'Lokalklima-Messnetz',
    email: 'gian-marco.alt@bd.zh.ch',
    keywords: ['Klima', 'Klimawandel', 'Hitzetage', 'Temperatur', 'Tropennächte'],
    topic: 'Luft und Klima',
    categories: ['WebMap', 'Visualisierung', 'Datenanalyse', 'Fachapplikationen', 'Dashboard'],
    visibility: 'both',
    description:
      'Seit 2019 betreibt das AWEL im Kanton Zürich ein Messnetz, um die klimatische Situation besser und aktueller zu beobachten. Mit der Messung von Lufttemperatur und -feuchte an etwa 50 Standorten lassen sich unterschiedliche Orte miteinander vergleichen, z.B. während einer Hitzeperiode. Ergänzt wird das Messnetz mit Stationen von «MeteoSchweiz».',
  },
];
