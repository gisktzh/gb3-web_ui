import {createActionGroup, emptyProps, props} from '@ngrx/store';
import {errorProps} from '../../../shared/utils/error-props.utils';
import {CantonWithGeometry, Municipality, MunicipalityWithGeometry} from '../../../shared/interfaces/gb3-geoshop-product.interface';

export const DataDownloadRegionActions = createActionGroup({
  source: 'DataDownloadRegion',
  events: {
    'Load Canton': emptyProps(),
    'Set Canton': props<{canton: CantonWithGeometry}>(),
    'Set Canton Error': errorProps(),
    'Load Municipalities': emptyProps(),
    'Set Municipalities': props<{municipalities: Municipality[]}>(),
    'Set Municipalities Error': errorProps(),
    'Load Current Municipality': props<{bfsNo: number}>(),
    'Set Current Municipality': props<{municipality: MunicipalityWithGeometry}>(),
    'Set Current Municipality Error': errorProps(),
    'Clear Current Municipality': emptyProps(),
  },
});
