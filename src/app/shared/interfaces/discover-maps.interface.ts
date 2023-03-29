export interface DiscoverMapsItem {
  title: string;
  description: string;
  mapId: string;
  fromDate: string;
  toDate: string;
  image: {
    url: string;
    name: string;
    type: string;
    size: number;
    path: string;
  };
}
