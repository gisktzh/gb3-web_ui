import {RecoverableError} from './abstract.errors';

export class DateTimeUnitNotSupported extends RecoverableError {
  public override message = 'Das Datums-/Zeit-Format wird nicht unterstützt.';
  public override name = 'DateTimeUnitNotSupported';
}
