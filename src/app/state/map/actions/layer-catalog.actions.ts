import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {Topic} from '../../../shared/interfaces/topic.interface';

export const LayerCatalogActions = createActionGroup({
  source: 'LayerCatalog',
  events: {
    'Load Layer Catalog': emptyProps(),
    'Set Layer Catalog': props<{items: Topic[]}>(),
    'Add Layer Catalog Item': props<{item: Topic}>(),
    'Clear Layer Catalog': emptyProps(),
    'Set Filter String': props<{filterString: string}>(),
    'Clear Filter String': emptyProps(),
  },
});
