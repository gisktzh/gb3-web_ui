import {OerebExtractListListItem} from '../types/oereb-extract-list-item.type';

export interface OerebExtractTheme {
  name: string;
  generalInfo: OerebExtractListListItem;
  restrictions: OerebExtractListListItem[];
}
