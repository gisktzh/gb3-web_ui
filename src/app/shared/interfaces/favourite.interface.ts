export interface Favourite {
  //todo: missing id
  title: string;
  content: object;
}

export type CreateFavourite = Pick<Favourite, 'title' | 'content'>;

export type FavouritesResponse = Favourite[];
