export interface FrequentlyUsedItem {
  id: string;
  title: string;
  description: string;
  url?: string;
  image?: FrequentlyUsedItemImage;
  created: Date;
}

interface FrequentlyUsedItemImage {
  url: string;
  name: string;
  type: string;
  size: number;
  path: string;
  altText?: string;
}
