export interface Favourite {
  //todo: missing id
  title: string;
  content: FavouriteLayerConfiguration[];
  /**
   * Declares whether a favourite is invalid because e.g. its components do no longer exist.
   */
  invalid?: boolean;
}

export type CreateFavourite = Pick<Favourite, 'title' | 'content'>;

export type FavouritesResponse = Favourite[];

interface FavouriteLayerSubLayerConfiguration {
  id: number;
  layer: string;
  visible: boolean;
}

export interface FavouriteLayerConfiguration {
  visible: boolean;
  opacity: number;
  isSingleLayer: boolean;
  id: string;
  mapId: string;
  layers: FavouriteLayerSubLayerConfiguration[];
}
