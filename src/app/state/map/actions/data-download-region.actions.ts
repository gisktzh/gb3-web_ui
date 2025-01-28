import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {errorProps} from '../../../shared/utils/error-props.utils';
import {BoundingBoxWithGeometry, Municipality} from '../../../shared/interfaces/gb3-geoshop-product.interface';

export const DataDownloadRegionActions = createActionGroup({
  source: 'DataDownloadRegion',
  events: {
    'Load Federation': emptyProps(),
    'Set Federation': props<{federation: BoundingBoxWithGeometry}>(),
    'Set Federation Error': errorProps(),
    'Load Canton': emptyProps(),
    'Set Canton': props<{canton: BoundingBoxWithGeometry}>(),
    'Set Canton Error': errorProps(),
    'Load Municipalities': emptyProps(),
    'Set Municipalities': props<{municipalities: Municipality[]}>(),
    'Set Municipalities Error': errorProps(),
  },
});
