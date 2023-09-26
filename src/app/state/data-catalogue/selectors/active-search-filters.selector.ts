import {createSelector} from '@ngrx/store';
import {selectFilterGroups} from '../../app/reducers/search.reducer';

export const selectActiveSearchFilterValues = createSelector(
  selectFilterGroups,
  (filterGroups): {groupLabel: string; filterLabel: string}[] => {
    return filterGroups.flatMap((group) =>
      group.filters.filter((filter) => filter.isActive).map((activeFilter) => ({groupLabel: group.label, filterLabel: activeFilter.label})),
    );
  },
);
