import {createSelector} from '@ngrx/store';
import {selectTerm} from '../reducers/search.reducer';

export const selectTerms = createSelector(selectTerm, (term) => term.split(' ').filter((t) => t.length > 0));
