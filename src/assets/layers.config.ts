export interface LayerConfig {
  id: string;
  name: string;
  url: string;
  layer: string;
  queryLayerName: string;
  queryLayers: string;
}

export const LayersConfig: LayerConfig[] = [
  {
    id: 'OGDAwelOekoMorphwwwZH',
    name: 'Ökomorph',
    url: 'http://wms.zh.ch/OGDAwelOekoMorphwwwZH',
    layer: 'OGDAwelOekoMorphwwwZH',
    queryLayerName: 'AwelOekoMorphwwwZH',
    queryLayers: 'seen,lk500,grenzen,gemeindegrenzen,abschnittsklassifizierung,gesamt'
  },
  {
    id: 'TbaBaustellenZHWMS',
    name: 'Baustellen KTZH',
    url: 'http://wms.zh.ch/TbaBaustellenZHWMS',
    layer: 'TbaBaustellenZHWMS',
    queryLayerName: 'TbaBaustellen2ZH',
    queryLayers:
      'seen,strassenregionen,lk500,gemeindegrenzen,unterhaltsbezirk,kilometer-marken,strassentypisierung-nach-richtplan,baustellen-uebersicht'
  },
  {
    id: 'AwelHitzebelastungZHWMS',
    name: 'Hitzebelastung',
    url: 'http://wms.zh.ch/AwelHitzebelastungZHWMS',
    layer: 'AwelHitzebelastungZHWMS',
    queryLayerName: 'AwelHitzebelastungZH',
    queryLayers: 'pet-tagessituation,aufenthaltsqualitaet,seen,lk200,grenzen,gemeindegrenzen'
  },
  {
    id: 'Basiskartezh',
    name: 'Basiskarte ZH',
    url: 'http://wms.zh.ch/BASISKARTEZH',
    layer: 'BASISKARTEZH',
    queryLayerName: 'BASISKARTEZH',
    queryLayers: 'wald,seen,lk500,grenzen,gemeindegrenzen'
  }
];
