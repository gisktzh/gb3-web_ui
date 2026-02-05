export interface EsriApiDrawingSymbol {
  name: string;
  title: string;
  itemType: string;
  dimensionality: string;
  format: ('web2d' | 'cim')[];
  cimRef: string;
  thumbnail: {
    href: string;
  };
}
