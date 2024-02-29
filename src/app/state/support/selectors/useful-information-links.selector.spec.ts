import {selectUsefulInformationLinksWithDynamicUrls} from './useful-information-links.selector';
import {DynamicInternalUrlsConfiguration} from '../../../shared/types/dynamic-internal-url.type';
import {AbstractLinksGroup} from '../../../shared/interfaces/links-group.interface';
import {DynamicBaseUrlUtils} from '../../../shared/utils/dynamic-base-url.utils';

const dynamicInternalUrlsConfiguration: DynamicInternalUrlsConfiguration = {
  geolion: {href: 'geolion'},
};
describe('selectUsefulInformationLinksWithDynamicUrls', () => {
  it('returns an empty list if links are present', () => {
    const actual = selectUsefulInformationLinksWithDynamicUrls.projector([], dynamicInternalUrlsConfiguration);

    expect(actual).toEqual([]);
  });

  it('calls DynamicBaseUrlUtils.convertRelativeLinkObjectToLinkObject for each link and returns the mapped links', () => {
    const serviceSpy = spyOn(DynamicBaseUrlUtils, 'convertRelativeLinkObjectToLinkObject');
    const usefulInformationLinks: AbstractLinksGroup[] = [
      {
        label: 'a',
        links: [
          {title: 'myTest1', href: 'testUrl'},
          {title: 'myTest2', href: 'testUrl'},
        ],
      },
      {label: 'b', links: [{title: 'myTest3', baseUrlType: 'geolion', relativeUrl: 't'}]},
    ];
    const actual = selectUsefulInformationLinksWithDynamicUrls.projector(usefulInformationLinks, dynamicInternalUrlsConfiguration);

    expect(actual.length).toEqual(2);
    expect(actual[0].links.length).toEqual(2);
    expect(actual[0].label).toEqual(usefulInformationLinks[0].label);
    expect(actual[1].links.length).toEqual(1);
    expect(actual[1].label).toEqual(usefulInformationLinks[1].label);
    expect(serviceSpy).toHaveBeenCalledTimes(3);
    expect(serviceSpy).toHaveBeenCalledWith(usefulInformationLinks[0].links[0], dynamicInternalUrlsConfiguration);
    expect(serviceSpy).toHaveBeenCalledWith(usefulInformationLinks[0].links[1], dynamicInternalUrlsConfiguration);
    expect(serviceSpy).toHaveBeenCalledWith(usefulInformationLinks[1].links[0], dynamicInternalUrlsConfiguration);
  });
});
