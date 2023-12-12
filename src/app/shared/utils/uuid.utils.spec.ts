import {UuidUtils} from './uuid.utils';
import {validate as validateUuid} from 'uuid';

describe('UuidUtils', () => {
  it('creates a UUID', () => {
    const uuid = UuidUtils.createUuid();
    expect(uuid).toBeDefined();
    expect(uuid).toBeInstanceOf(String);
    expect(validateUuid(uuid)).toBeTrue();
  });
});
