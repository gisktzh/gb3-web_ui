import {AvailableIndex} from "../services/apis/search/interfaces/available-index.interface";

export const SPECIAL_SEARCH_CONFIG = [
  {
    title: 'Verkehrsmessstelle',
    index: 'VerkehrsmessstellenIndex',
    topics: [
      'TBAVMSZH',
      'TbaVerkehrstechnikZH'
    ]
  },
  {
    title: 'Verkehrstechnik',
    index: 'VerkehrstechnikIndex',
    topics: [
      'TbaVerkehrstechnikZH'
    ]
  },
  {
    title: 'Beleuchtung',
    index: 'BeleuchtungIndex',
    topics: [
      'TbaVerkehrstechnikZH'
    ]
  },
  {
    title: 'Schacht',
    index: 'SchachtIndex',
    topics: [
      'TbaSseZH',
      'TbaNseZH'
    ]
  },
  {
    title: 'Wasserrecht',
    index: 'WasserrechtIndex',
    topics: [
      'AwelWBZH',
      'AwelWBwwwZH'
    ]
  },
  {
    title: 'Gewässer',
    index: 'GewaesserIndex',
    topics: [
      'AwelGewHydZH',
      'AwelGKHWsynoptischZH',
      'AwelGKHWwassertiefen1ZH',
      'AwelGKHWmassenbewegungZH',
      'AwelOberAbflussZH',
      'AwelOekoMorphZH',
      'AwelRKNGZH',
      'AwelWBRevitZH',
      'AwelWBRevitwwwZH',
      'AwelWBHydroStudZH',
      'AwelWBwwwZH',
      'AwelWBZustwwwZH',
      'AwelWBZustZH',
      'AwelWBVermessZH',
      'AwelWBwwwPWZH',
      'AwelWBZH'
    ]
  },
  {
    title: 'Wasser-Fassung',
    index: 'FassungIndex',
    topics: [
      'AwelGrundWaHWwwwZH',
      'AwelGrundWaHWZH',
      'AwelGrundWaMWwwwZH',
      'AwelGrundWaMWZH',
      'AWELWWgwsZH'
    ]
  },
  {
    title: 'GVZ-Nr.',
    index: 'GvzIndex',
    topics: [
      'ArchDenkmalZH',
      'ArchInvRevZH',
      'AVfarbigwwwZH',
      'AVfarbigZH',
      'AVswwwwZH',
      'AVswZH',
      'AwelKanalnetzZH',
      'GVZstzhZH',
      'GVZZH',
      'GVZPrae2ZH',
      'GVZHagelZH',
      'GVZSchadenZH',
      'IGKGEWZH',
      'ImmoRegEditZH',
      'ImmoRegViewZH',
      'TankkatZH'
    ]
  },
  {
    title: 'Bienenstand',
    index: 'BienenstaendeIndex',
    topics: [
      'VetBienenstaendeZH'
    ]
  },
  {
    title: 'Veloverbundung',
    index: 'VeloverbindungenIndex',
    topics: [
      'VeloAlltagZH'
    ]
  },
  {
    title: 'Kilometrierung',
    index: 'StrkmIndex',
    topics: [
      'TbaBaustellen2ZH',
      'TbaBaustellenEditZH',
      'TbaBaustellenZH',
      'TBABauvorhabenIDPMZH',
      'TBAKonzessionZH',
      'TbaNseZH',
      'TBAPVIBP2ZH',
      'TBAPVISt2ZH',
      'TBAZH'
    ]
  },
  {
    title: 'Boje',
    index: 'BojeIndex',
    topics: [
      'AwelSBKwwwZH',
      'AwelSBKZH'
    ]
  }
];

export const DEFAULT_SEARCHES: AvailableIndex[] = [
  {
    indexName: 'fme-addresses',
    displayString: 'Adressen',
    active: true
  },
  {
    indexName: 'fme-places',
    displayString: 'Orte',
    active: true
  }
];

export const MAP_SEARCH: AvailableIndex = {
  indexName: '',
  displayString: 'Karten',
  active: true
};
