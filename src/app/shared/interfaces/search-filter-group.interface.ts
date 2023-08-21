import {SearchType} from '../types/search.type';

export interface SearchFilterGroup {
  label: string;
  useDynamicActiveMapItemsFilter: boolean;
  filters: SearchFilter[];
}

export interface SearchFilter {
  label: string;
  isActive: boolean;
  type: SearchType;
}
