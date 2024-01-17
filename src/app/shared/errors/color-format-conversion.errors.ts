import {RecoverableError} from './abstract.errors';

export class InvalidRGBFormat extends RecoverableError {
  public override message = 'Die Eingabe entspricht keiner gültigen Farbe im RGB-Format.';
  public override name = 'InvalidRGBFormat';
}

export class InvalidHexFormat extends RecoverableError {
  public override message = 'Die Eingabe entspricht keiner gültigen Farbe im Hex-Format.';
  public override name = 'InvalidHexFormat';
}
