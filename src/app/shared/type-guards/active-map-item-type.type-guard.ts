import {ActiveMapItem} from '../../map/models/active-map-item.model';

/**
 * Generic constructor type which allows for classes as input parameters
 */
type Constructor<T> = new (...args: never[]) => T;

/**
 * This typeguard can be used to check whether an ActiveMapItem is of a certain concrete implementation. It returns a
 * function which takes an ActiveMapItem as its input, on which the check for implementation class is performed.
 *
 * Example:
 *
 * * arrayOfMapItems.filter(isActiveMapItemOfType(MyActiveMapItemImplementation) => This filters all data and correctly
 * maps the type.
 * @param type
 */
export function isActiveMapItemOfType<T extends ActiveMapItem>(type: Constructor<T>): (item: ActiveMapItem) => item is T {
  return (item): item is T => item instanceof type;
}
