import {OerebExtractListItem} from '../types/oereb-extract-list-item.type';

export interface OerebExtractTheme {
  name: string;
  generalInfo: OerebExtractListItem[];
  restrictions: OerebExtractListItem[];
}
