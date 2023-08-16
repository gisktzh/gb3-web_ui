/**
 * This function can be used to spy on property getters of SpyObj similar to methods.
 * More information: https://stackoverflow.com/questions/64560390/jasmine-createspyobj-with-properties
 * @param spyObj The object of type `SpyObj<T>` to be spied upon
 * @param propName The property whose 'getter' shall be spied upon
 */
export function spyPropertyGetter<T, K extends keyof T>(spyObj: jasmine.SpyObj<T>, propName: K): jasmine.Spy<() => T[K]> {
  return Object.getOwnPropertyDescriptor(spyObj, propName)?.get as jasmine.Spy<() => T[K]>;
}
