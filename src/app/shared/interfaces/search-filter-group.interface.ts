// TODO WES rename to filtergroup

import {SearchType} from '../types/search.type';

export interface SearchFilterGroup {
  label: string;
  filters: SearchFilter[];
}

export interface SearchFilter {
  label: string;
  isActive: boolean;
  type: SearchType;
}
