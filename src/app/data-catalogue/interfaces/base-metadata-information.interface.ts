import {Image} from '../../shared/interfaces/image.interface';

export interface BaseMetadataInformation {
  itemTitle: string;
  category: string;
  shortDescription?: string;
  imageUrl: Image | null;
}
