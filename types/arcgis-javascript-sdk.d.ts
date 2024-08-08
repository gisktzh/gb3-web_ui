declare namespace __esri {
  /**
   * This override is necessary because the original `Collection.find` method does incorrectly omit the possibility of returning undefined
   * if the callback does not return a truthy value.
   */
  interface Collection<T> {
    find(callback: __esri.ItemTestCallback<T>): T | undefined;
  }
}
