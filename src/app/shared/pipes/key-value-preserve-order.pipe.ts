import {Pipe, PipeTransform} from '@angular/core';
import {KeyValuePipe} from '@angular/common';

/**
 * Extension of KeyValuePipe that uses a fixed compareFn that always returns 0, essentially preserving the key order of the object. This
 * is necessary because the KeyValuePipe orders the keys ascending: https://angular.io/api/common/KeyValuePipe#description
 */
@Pipe({
  name: 'keyValuePreserveOrder'
})
export class KeyValuePreserveOrderPipe extends KeyValuePipe implements PipeTransform {
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  public override transform(value: any): any {
    return super.transform(value, this.preserveOrder);
  }

  private preserveOrder() {
    return 0;
  }
}
