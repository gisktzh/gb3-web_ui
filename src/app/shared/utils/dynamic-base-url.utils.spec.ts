import {LinkObject} from '../interfaces/link-object.interface';
import {DynamicBaseUrlUtils} from './dynamic-base-url.utils';
import {DynamicInternalUrlsConfiguration} from '../types/dynamic-internal-url.type';
import {RelativeLinkObject} from '../interfaces/relative-link-object.interface';

const dynamicInternalUrlsConfiguration: DynamicInternalUrlsConfiguration = {
  geolion: {href: 'geolionbase'},
};
describe('DynamicBaseUrlUtils', () => {
  describe('convertRelativeLinkObjectToLinkObject', () => {
    it('returns the link unchanged if it is a LinkObject', () => {
      const linkObject: LinkObject = {
        href: 'test',
        title: 'x',
      };

      const actual = DynamicBaseUrlUtils.convertRelativeLinkObjectToLinkObject(linkObject, dynamicInternalUrlsConfiguration);

      expect(actual).toEqual(linkObject);
    });

    it('returns the full url for a relative LinkObject', () => {
      const linkObject: RelativeLinkObject = {
        title: 'relative',
        baseUrlType: 'geolion',
        relativeUrl: '/path/to',
      };

      const actual = DynamicBaseUrlUtils.convertRelativeLinkObjectToLinkObject(linkObject, dynamicInternalUrlsConfiguration);

      const expected: LinkObject = {
        href: 'geolionbase/path/to',
        title: 'relative',
      };
      expect(actual).toEqual(expected);
    });
  });
});
