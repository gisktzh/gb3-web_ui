import {Map, Topic} from '../../../shared/interfaces/topic.interface';
import {selectLoadedLayerCatalogueAndShareItem} from './loaded-layer-catalogue-and-share-item.selector';
import {LoadingState} from '../../../shared/types/loading-state';
import {ShareLinkItem} from '../../../shared/interfaces/share-link.interface';

describe('selectLoadedLayerCatalogueAndShareItem', () => {
  let topicsMockState: Topic[];
  let shareLinkItemState: ShareLinkItem;
  beforeEach(() => {
    topicsMockState = [
      {
        title: 'topic-1',
        maps: [{id: 'test-map-1'} as Map],
      },
      {
        title: 'topic-2',
        maps: [],
      },
    ];
    shareLinkItemState = {
      basemapId: 'arelkbackgroundzh',
      center: {x: 2675158, y: 1259964},
      scale: 18000,
      content: [],
      drawings: [],
      measurements: [],
    };
  });

  it('returns the current topics and the share link item if both are loaded', () => {
    const topicsLoadingState = 'loaded';
    const shareLinkLoadingState = 'loaded';
    const actual = selectLoadedLayerCatalogueAndShareItem.projector(
      topicsMockState,
      topicsLoadingState,
      shareLinkItemState,
      shareLinkLoadingState,
    );
    const expected = {topics: topicsMockState, shareLinkItem: shareLinkItemState};
    expect(actual).toEqual(expected);
  });

  it('returns `undefined` if either the topics or the share link item are not yet loaded', () => {
    const allLoadingStates: LoadingState[] = ['undefined', 'error', 'loading', 'loaded'];
    allLoadingStates.forEach((topicsLoadingState) => {
      allLoadingStates.forEach((shareLinkLoadingState) => {
        if (topicsLoadingState === 'loaded' && shareLinkLoadingState === 'loaded') {
          // this is the state where 'undefined' is not returned! Skip for this test.
          return;
        }

        const actual = selectLoadedLayerCatalogueAndShareItem.projector(
          topicsMockState,
          topicsLoadingState,
          shareLinkItemState,
          shareLinkLoadingState,
        );
        const expected = undefined;
        expect(actual).toEqual(expected);
      });
    });
  });
});
