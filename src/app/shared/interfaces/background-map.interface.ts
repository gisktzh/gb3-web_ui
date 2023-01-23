export interface BackgroundMapLayer {
  name: string;
}

export interface BackgroundMap {
  url: string;
  title: string;
  srsId: number;
  layers: BackgroundMapLayer[];
}
