export type EsriDrawingSymbol = {
  name: string;
  title: string;
  itemType: string;
  dimensionality: string;
  category: string;
  tags: string[];
  format: ('web2d' | 'cim')[];
  cimRef: string;
  thumbnail: {
    href: string;
  };
};
