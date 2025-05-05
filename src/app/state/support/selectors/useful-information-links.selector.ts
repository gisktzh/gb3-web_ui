import {createSelector} from '@ngrx/store';
import {selectUsefulInformationLinks} from '../reducers/support-content.reducer';
import {selectDynamicInternalUrlsConfiguration} from '../../app/reducers/app.reducer';
import {LinksGroup} from '../../../shared/interfaces/links-group.interface';
import {DynamicBaseUrlUtils} from '../../../shared/utils/dynamic-base-url.utils';

export const selectUsefulInformationLinksWithDynamicUrls = createSelector(
  selectUsefulInformationLinks,
  selectDynamicInternalUrlsConfiguration,
  (usefulInformationLinks, dynamicInternalUrlsConfiguration): LinksGroup[] => {
    return usefulInformationLinks.map((usefulInformationLink) => ({
      ...usefulInformationLink,
      links: usefulInformationLink.links.map((link) =>
        DynamicBaseUrlUtils.convertRelativeLinkObjectToLinkObject(link, dynamicInternalUrlsConfiguration),
      ),
    }));
  },
);
