import {v4 as uuidv4} from 'uuid';

export class UuidUtils {
  public static createUuid(): string {
    return uuidv4();
  }
}
