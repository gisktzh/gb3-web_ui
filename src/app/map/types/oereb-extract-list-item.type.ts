type OerebExtractListItemBase = {itemLabel: string};

export type OerebExtractTestListItem = OerebExtractListItemBase & {itemType: 'text'; text: string};
export type OerebExtractUrlListItem = OerebExtractListItemBase & {itemType: 'url'; url: string};
export type OerebExtractListListItem = OerebExtractListItemBase & {itemType: 'list'; items: OerebExtractListItem[]};
export type OerebExtractImageListItem = OerebExtractListItemBase & {
  itemType: 'image';
  url: string;
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type OerebExtractListItem =
  | OerebExtractTestListItem
  | OerebExtractUrlListItem
  | OerebExtractListListItem
  | OerebExtractImageListItem;
