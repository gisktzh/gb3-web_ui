import {Map, Topic} from '../../../shared/interfaces/topic.interface';
import {selectLoadedLayerCatalogueAndShareItem} from './loaded-layer-catalogue-and-share-item.selector';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {ShareLinkItem} from '../../../shared/interfaces/share-link.interface';
import {Gb3VectorLayer} from '../../../shared/interfaces/gb3-vector-layer.interface';

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
      drawings: {} as Gb3VectorLayer,
      measurements: {} as Gb3VectorLayer,
    };
  });

  it('returns the current topics and the share link item if both have the state `loaded`; returns `undefined` otherwise', () => {
    const allLoadingStates: LoadingState[] = [undefined, 'error', 'loading', 'loaded'];
    allLoadingStates.forEach((topicsLoadingState) => {
      allLoadingStates.forEach((shareLinkLoadingState) => {
        const actual = selectLoadedLayerCatalogueAndShareItem.projector(
          topicsMockState,
          topicsLoadingState,
          shareLinkItemState,
          shareLinkLoadingState,
        );

        let expected;
        if (topicsLoadingState === 'loaded' && shareLinkLoadingState === 'loaded') {
          expected = {topics: topicsMockState, shareLinkItem: shareLinkItemState};
        } else {
          expected = undefined;
        }
        expect(actual).toEqual(expected);
      });
    });
  });
});
