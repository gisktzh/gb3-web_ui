import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {LayerCatalogItem} from '../../../../shared/interfaces/topic.interface';

export const LayerCatalogActions = createActionGroup({
  source: 'LayerCatalog',
  events: {
    'Load Layer Catalog': emptyProps(),
    'Set Layer Catalog': props<{layerCatalogItems: LayerCatalogItem[]}>(),
    'Add Layer Catalog Item': props<{layerCatalogItem: LayerCatalogItem}>(),
    'Clear Layer Catalog': emptyProps()
  }
});
