import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {errorProps} from '../../../shared/utils/error-props.utils';
import {CantonWithGeometry, Municipality} from '../../../shared/interfaces/gb3-geoshop-product.interface';

export const DataDownloadRegionActions = createActionGroup({
  source: 'DataDownloadRegion',
  events: {
    'Load Canton': emptyProps(),
    'Set Canton': props<{canton: CantonWithGeometry}>(),
    'Set Canton Error': errorProps(),
    'Load Municipalities': emptyProps(),
    'Set Municipalities': props<{municipalities: Municipality[]}>(),
    'Set Municipalities Error': errorProps(),
  },
});
