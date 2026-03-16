import {UuidUtils} from './uuid.utils';
import {validate as validateUuid} from 'uuid';

describe('UuidUtils', () => {
  it('creates a UUID', () => {
    const uuid = UuidUtils.createUuid();
    expect(uuid).toBeDefined();
    expect(validateUuid(uuid)).toBe(true);
  });
});
