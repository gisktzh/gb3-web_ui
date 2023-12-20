import {RecoverableError} from './abstract.errors';

export class InvalidRGBFormat extends RecoverableError {
  public override message = 'Der Input stimmt nicht mit dem RGB-Format überein.';
  public override name = 'InvalidRGBFormat';
}

export class InvalidHexFormat extends RecoverableError {
  public override message = 'Der Input stimmt nicht mit dem Hex-Format überein';
  public override name = 'InvalidHexFormat';
}
