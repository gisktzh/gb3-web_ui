import {props} from '@ngrx/store';

/**
 * Reusable error props for ngrx actions that should pass a thrown error to reducers and effects as their payload.
 */
export const errorProps = props<{error?: unknown}>;
