import {StorageUtils} from './storage.utils';
import {TimeExtentUtils} from './time-extent.utils';

describe('StorageUtils', () => {
  describe('parseJson', () => {
    it(`parses a Json with valid Dates correctly`, () => {
      const stringToParse: string = '{"date":"1506-01-01T00:00:00.000Z", "number": 2683132, "string": "test"}';

      const expectedJsonObject = {date: TimeExtentUtils.parseDefaultUTCDate('1506-01-01T00:00:00.000Z'), number: 2683132, string: 'test'};
      expect(StorageUtils.parseJson(stringToParse)).toEqual(expectedJsonObject);
    });
    it(`does not parses an invalid Date-String `, () => {
      const stringToParse: string = '{"invalidDate":"T1506-01-01T00:00:00.000Z"}';

      const expectedJsonObject = {invalidDate: 'T1506-01-01T00:00:00.000Z'};
      expect(StorageUtils.parseJson(stringToParse)).toEqual(expectedJsonObject);
    });
    it(`does not parses a number as Date`, () => {
      const stringToParse: string = '{"validDateAsNumber":19000101}';

      const expectedJsonObject = {validDateAsNumber: 19000101};
      expect(StorageUtils.parseJson(stringToParse)).toEqual(expectedJsonObject);
    });
  });
});
