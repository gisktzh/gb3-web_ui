import {HasTypeArgumentList} from './has-type-argument-list';

export interface InjectionToken extends HasTypeArgumentList {
  tokenName: string;
  propertyName: string;
  fullTypeArg: string | undefined;
}
