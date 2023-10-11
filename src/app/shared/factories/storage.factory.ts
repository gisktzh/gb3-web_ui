import {OAuthStorage} from 'angular-oauth2-oidc';

export function storageFactory(): OAuthStorage {
  return localStorage;
}
