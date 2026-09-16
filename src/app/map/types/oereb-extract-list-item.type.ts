export type OerebExtractListItem = {displayValue: string} & (
  | {itemType: 'text'}
  | {itemType: 'url'; url: string}
  | {itemType: 'list'; items: OerebExtractListItem[]}
  | {itemType: 'image'; url: string; src: string; alt: string; width: number; height: number}
);
