import {immerable} from 'immer';

/**
 * Every class that is used with immer needs to implement this interface and set it to true. The reason for this is described in detail at
 * https://immerjs.github.io/immer/complex-objects/; but in short, it's because custom classes create objects with a prototype and these are
 * not handled by default; but they need to be explicitly marked.
 */
export interface IsImmerable {
  [immerable]: boolean;
}
