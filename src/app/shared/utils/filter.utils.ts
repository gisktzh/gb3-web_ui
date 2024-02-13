import {SearchFilterGroup} from '../interfaces/search-filter-group.interface';
import {SearchType} from '../types/search.type';

export class FilterUtils {
  /**
   * Checks whether the given searchType filter is set or if no filter at all is set.
   * @param filterGroups
   * @param searchType
   */
  public static isSearchFilterActive(filterGroups: SearchFilterGroup[], searchType: SearchType): boolean {
    const filters = filterGroups.flatMap((filterGroup) => filterGroup.filters);
    const isNoFilterActive = filters.every((filter) => !filter.isActive); // no filter active means all results are shown (all filters active === no filter active)
    return isNoFilterActive || (filters.find((filter) => filter.type === searchType)?.isActive ?? false);
  }
}
