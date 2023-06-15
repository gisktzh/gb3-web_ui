import {ActiveMapItem} from '../../map/models/active-map-item.model';

/**
 * Generic constructor type which allows for classes as input parameters
 */
type Constructor<T> = new (...args: any[]) => T;

/**
 * This typeguard can be used to check whether an ActiveMapItem has a certain ActiveMapItemConfiguration implementation. It returns a
 * function which takes an ActiveMapItem as its input, on which the check for the given configurationType class is executed.
 *
 * Example:
 *
 * * arrayOfMapItems.filter(isActiveMapItemOfType(MyActiveMapItemConfigurationImplementation) => This filters all data and correctly
 * maps the type.
 * @param configurationType
 */
export function isActiveMapItemOfType<T extends ActiveMapItem>(configurationType: Constructor<T>): (item: ActiveMapItem) => item is T {
  return (item): item is T => item instanceof configurationType;
}
