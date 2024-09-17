export interface DiscoverMapsItem {
  id: string;
  title: string;
  description: string;
  mapId: string;
  fromDate: Date;
  toDate: Date;
  image: DiscoverMapsItemImage;
}

interface DiscoverMapsItemImage {
  url: string;
  name: string;
  type: string;
  size: number;
  path: string;
  altText: string | undefined;
}
