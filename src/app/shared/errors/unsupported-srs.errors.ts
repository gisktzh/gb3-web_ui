import {RecoverableError} from './abstract.errors';

export class UnsupportedSrs extends RecoverableError {
  public override name = 'UnsupportedSrs';
  constructor(unsupportedSrs: number) {
    super();
    this.message = `Koordinatenreferenzsystem wird nicht unterstützt: ${unsupportedSrs}`;
  }
}
