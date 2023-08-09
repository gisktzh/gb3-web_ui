import {createSelector} from '@ngrx/store';
import {selectItems} from '../reducers/data-catalogue.reducer';
import {DataCatalogueFilterProperty} from '../../../shared/interfaces/data-catalogue-filter-property.interface';
import {DataCatalogueFilter} from '../../../shared/types/data-catalogue-filter';

const filters: DataCatalogueFilterProperty[] = [
  // todo: add ogd
  {key: 'type', label: 'Kategorie'},
  {key: 'responsibleDepartment', label: 'Datenbereitsteller'},
  {key: 'outputFormat', label: 'Dateiformate'},
];

export const selectDataCatalogueFilters = createSelector(selectItems, (metaDataItems) => {
  const uniqueValues: DataCatalogueFilter = new Map();

  metaDataItems.forEach((m) => {
    filters.forEach((filter) => {
      if (filter.key in m) {
        const value: string = (m as any)[filter.key]; //this typecast is safe here because we _know_ the property exists here
        if (!uniqueValues.has(filter)) {
          uniqueValues.set(filter, new Set());
        }
        uniqueValues.get(filter)?.add(value);
      }
    });
  });

  return uniqueValues;
});
