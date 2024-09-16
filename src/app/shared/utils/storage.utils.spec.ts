import {StorageUtils} from './storage.utils';
import {DayjsTimeService} from '../services/dayjs-time.service';

describe('StorageUtils', () => {
  describe('parseJson', () => {
    it(`parses a Json with valid Dates correctly`, () => {
      const stringToParse =
        '{"date":"1506-01-01T00:00:00.000Z", "number": 2683132, "string": "test", "stringifiedNumberParseableAsDate": "12"}';

      const expectedJsonObject = {
        date: DayjsTimeService.parseUTCDate('1506-01-01T00:00:00.000Z'),
        number: 2683132,
        string: 'test',
        stringifiedNumberParseableAsDate: '12',
      };
      expect(StorageUtils.parseJson(stringToParse)).toEqual(expectedJsonObject);
    });
    it(`does not parses an invalid Date-String `, () => {
      const stringToParse = '{"invalidDate":"T1506-01-01T00:00:00.000Z"}';

      const expectedJsonObject = {invalidDate: 'T1506-01-01T00:00:00.000Z'};
      expect(StorageUtils.parseJson(stringToParse)).toEqual(expectedJsonObject);
    });
    it(`does not parses a number as Date`, () => {
      const stringToParse = '{"validDateAsNumber":19000101}';

      const expectedJsonObject = {validDateAsNumber: 19000101};
      expect(StorageUtils.parseJson(stringToParse)).toEqual(expectedJsonObject);
    });
  });
});
