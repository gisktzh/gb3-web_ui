export interface LayerConfig {
  id: string
  name: string
  url: string
  layer: string
  queryLayerName: string
}

export const LayersConfig: LayerConfig[] = [
  {
    id: 'OGDAwelOekoMorphwwwZH',
    name: 'Ökomorph',
    url: 'http://wms.zh.ch/OGDAwelOekoMorphwwwZH',
    layer: 'OGDAwelOekoMorphwwwZH',
    queryLayerName: 'AwelOekoMorphwwwZH'
  },
  {
    id: 'TbaBaustellenZHWMS',
    name: 'Baustellen KTZH',
    url: 'http://wms.zh.ch/TbaBaustellenZHWMS',
    layer: 'TbaBaustellenZHWMS',
    queryLayerName: 'TbaBaustellen2ZH'
  },
  {
    id: 'AwelHitzebelastungZHWMS',
    name: 'Hitzebelastung',
    url: 'http://wms.zh.ch/AwelHitzebelastungZHWMS',
    layer: 'AwelHitzebelastungZHWMS',
    queryLayerName: 'AwelHitzebelastungZH'
  },
  {
    id: 'AVSO',
    name: 'AVSO',
    url: 'https://geo.so.ch/api/wms',
    layer: 'ch.bl.agi.lidar_2018.dsm_relief,ch.bl.agi.lidar_2018.dsm',
    queryLayerName: 'Solothurn Daten 2 Layer'
  },
]
