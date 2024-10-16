import {initialState, reducer} from './active-map-item.reducer';
import {ActiveMapItemState} from '../states/active-map-item.state';
import {ActiveMapItem} from '../../../map/models/active-map-item.model';
import {createDrawingMapItemMock, createGb2WmsMapItemMock} from '../../../testing/map-testing/active-map-item-test.utils';
import {UserDrawingLayer} from '../../../shared/enums/drawing-layer.enum';
import {ActiveMapItemActions} from '../actions/active-map-item.actions';
import {Gb2WmsActiveMapItem} from '../../../map/models/implementations/gb2-wms.model';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {ViewProcessState} from '../../../shared/types/view-process-state.type';
import {isActiveMapItemOfType} from '../../../shared/type-guards/active-map-item-type.type-guard';
import {FilterConfiguration, Map} from '../../../shared/interfaces/topic.interface';
import {ActiveMapItemFactory} from '../../../shared/factories/active-map-item.factory';
import {FavouriteBaseConfig} from '../../../shared/interfaces/favourite.interface';

describe('ActiveMapItem Reducer', () => {
  const activeMapItemsMock: ActiveMapItem[] = [
    createDrawingMapItemMock(UserDrawingLayer.Measurements, true, 1),
    createDrawingMapItemMock(UserDrawingLayer.Drawings, false, 0.451),
    createGb2WmsMapItemMock('mapMockOne', 3, true, 0.777),
    createGb2WmsMapItemMock('mapMockTwo', 0, true, 0),
  ];

  let existingState: ActiveMapItemState;

  beforeEach(() => {
    existingState = {
      items: [...activeMapItemsMock],
    };
  });

  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;
      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('addActiveMapItem', () => {
    it('adds the item to the list at the desired position (assumption: it is not already in the state)', () => {
      const expectedActiveMapItem = createGb2WmsMapItemMock('new unique item');
      const expectedPosition = 1;
      const action = ActiveMapItemActions.addActiveMapItem({activeMapItem: expectedActiveMapItem, position: expectedPosition});
      const state = reducer(existingState, action);

      expect(state.items.length).toBe(activeMapItemsMock.length + 1);
      state.items.forEach((item, index) => {
        if (index < expectedPosition) {
          expect(item).toEqual(activeMapItemsMock[index]);
        } else if (index === expectedPosition) {
          expect(item).toEqual(expectedActiveMapItem);
        } else {
          expect(item).toEqual(activeMapItemsMock[index - 1]);
        }
      });
    });

    it('does not add the item to the list if it is already in the state', () => {
      const expectedActiveMapItem = createGb2WmsMapItemMock('new unique item');
      const expectedPosition = 1;
      existingState.items.push(expectedActiveMapItem);
      const action = ActiveMapItemActions.addActiveMapItem({activeMapItem: expectedActiveMapItem, position: expectedPosition});
      const state = reducer(existingState, action);

      expect(state.items.length).toBe(existingState.items.length);
      expect(state.items).toEqual(existingState.items);
    });

    it('converts a temporary item to nonTemporary if it is added', () => {
      const expectedActiveMapItem = createGb2WmsMapItemMock('new unique item', undefined, undefined, undefined, undefined, true);
      existingState.items.push(expectedActiveMapItem);
      const action = ActiveMapItemActions.addActiveMapItem({activeMapItem: expectedActiveMapItem, position: 0});
      const state = reducer(existingState, action);

      expect(state.items.length).toBe(existingState.items.length);
      expect(state.items[0].isTemporary).toBeFalse();
    });
  });

  describe('removeActiveMapItem', () => {
    it('removes the item from the list (assumption: it is already in the state)', () => {
      const expectedActiveMapItem = createGb2WmsMapItemMock('new unique item');
      existingState.items.push(expectedActiveMapItem);
      const action = ActiveMapItemActions.removeActiveMapItem({activeMapItem: expectedActiveMapItem});
      const state = reducer(existingState, action);

      expect(state.items.length).toBe(existingState.items.length - 1);
      expect(state.items).not.toContain(expectedActiveMapItem);
    });

    it('does not remove anything if the item is not in the state', () => {
      const expectedActiveMapItem = createGb2WmsMapItemMock('new unique item');
      const action = ActiveMapItemActions.removeActiveMapItem({activeMapItem: expectedActiveMapItem});
      const state = reducer(existingState, action);

      expect(state.items.length).toBe(existingState.items.length);
      expect(state.items).toEqual(existingState.items);
    });
  });

  describe('removeAllTemporaryActiveMapItems', () => {
    it('removes all temporary items', () => {
      const temporaryItems: ActiveMapItem[] = [
        createGb2WmsMapItemMock('temp-1', 0, true, 1, 'uuid-1', true),
        createGb2WmsMapItemMock('temp-2', 0, true, 1, 'uuid-2', true),
      ];
      const extendedState: ActiveMapItemState = {items: [...existingState.items, ...temporaryItems]};
      const action = ActiveMapItemActions.removeAllTemporaryActiveMapItems();
      const state = reducer(extendedState, action);

      expect(state.items.length).toBe(existingState.items.length);
      expect(state.items).toEqual(existingState.items);
    });
  });

  describe('removeAllActiveMapItems', () => {
    it('removes all items', () => {
      const action = ActiveMapItemActions.removeAllActiveMapItems();
      const state = reducer(existingState, action);

      expect(state.items.length).toBe(0);
    });
  });

  describe('moveToTop', () => {
    it('moves the item to the top (index: 0) of the list (assumption: it is already in the state)', () => {
      const expectedActiveMapItem = createGb2WmsMapItemMock('new unique item');
      existingState.items.splice(2, 0, expectedActiveMapItem);
      const action = ActiveMapItemActions.moveToTop({activeMapItem: expectedActiveMapItem});
      const state = reducer(existingState, action);

      expect(state.items.length).toBe(existingState.items.length);
      state.items.forEach((item, index) => {
        if (index === 0) {
          expect(item).toEqual(expectedActiveMapItem);
        } else {
          expect(item).toEqual(activeMapItemsMock[index - 1]);
        }
      });
    });

    it('does not move anything if the item is not in the state', () => {
      const expectedActiveMapItem = createGb2WmsMapItemMock('new unique item');
      const action = ActiveMapItemActions.moveToTop({activeMapItem: expectedActiveMapItem});
      const state = reducer(existingState, action);

      expect(state.items.length).toBe(existingState.items.length);
      expect(state.items).toEqual(existingState.items);
    });
  });

  describe('forceFullVisibility', () => {
    it('sets the opacity to 1 and the visibility to true for the item (assumption: it is already in the state)', () => {
      const expectedActiveMapItem = createGb2WmsMapItemMock('new unique item', 0, true, 0.123);
      const expectedPosition = 2;
      existingState.items.splice(expectedPosition, 0, expectedActiveMapItem);
      const action = ActiveMapItemActions.forceFullVisibility({activeMapItem: expectedActiveMapItem});
      const state = reducer(existingState, action);

      expect(state.items.length).toBe(existingState.items.length);
      state.items.forEach((item, index) => {
        if (index < expectedPosition) {
          expect(item.opacity).toBe(activeMapItemsMock[index].opacity);
          expect(item.visible).toBe(activeMapItemsMock[index].visible);
        } else if (index === expectedPosition) {
          expect(item.id).toBe(expectedActiveMapItem.id);
          expect(item.opacity).toBe(1);
          expect(item.visible).toBe(true);
        } else {
          expect(item.opacity).toBe(activeMapItemsMock[index - 1].opacity);
          expect(item.visible).toBe(activeMapItemsMock[index - 1].visible);
        }
      });
    });

    it('does not set anything if the item is not in the state', () => {
      const expectedActiveMapItem = createGb2WmsMapItemMock('new unique item', 0, true, 0.123);
      const action = ActiveMapItemActions.forceFullVisibility({activeMapItem: expectedActiveMapItem});
      const state = reducer(existingState, action);

      expect(state.items.length).toBe(existingState.items.length);
      expect(state.items).toEqual(existingState.items);
    });
  });

  describe('setOpacity', () => {
    it('sets the opacity for the item (assumption: it is already in the state)', () => {
      const expectedOpacity = 0.1337;
      const expectedActiveMapItem = createGb2WmsMapItemMock('new unique item', 0, false, 0.123);
      existingState.items.splice(2, 0, expectedActiveMapItem);
      const action = ActiveMapItemActions.setOpacity({opacity: expectedOpacity, activeMapItem: expectedActiveMapItem});
      const state = reducer(existingState, action);

      expect(state.items.length).toBe(existingState.items.length);
      state.items.forEach((item) => {
        if (item.id === expectedActiveMapItem.id) {
          expect(item.opacity).toBe(expectedOpacity);
        } else {
          expect(item.opacity).not.toBe(expectedOpacity);
        }
      });
    });

    it('does not set anything if the item is not in the state', () => {
      const opacity = 0.1337;
      const activeMapItem = createGb2WmsMapItemMock('new unique item');
      const action = ActiveMapItemActions.setOpacity({opacity: opacity, activeMapItem: activeMapItem});
      const state = reducer(existingState, action);

      expect(state.items.length).toBe(existingState.items.length);
      expect(state.items).toEqual(existingState.items);
    });
  });

  describe('setVisibility', () => {
    it('sets the visibility for the item (assumption: it is already in the state)', () => {
      const expectedVisibility = true;
      const expectedActiveMapItem = createGb2WmsMapItemMock('new unique item', 0, false, 0.123);
      existingState.items.splice(2, 0, expectedActiveMapItem);
      const action = ActiveMapItemActions.setVisibility({visible: expectedVisibility, activeMapItem: expectedActiveMapItem});
      const state = reducer(existingState, action);

      expect(state.items.length).toBe(existingState.items.length);
      const actualItem = state.items.find((item) => item.id === expectedActiveMapItem.id);
      expect(actualItem).toBeDefined();
      expect(actualItem!.visible).toBe(expectedVisibility);
    });

    it('does not set anything if the item is not in the state', () => {
      const visibility = false;
      const activeMapItem = createGb2WmsMapItemMock('new unique item');
      const action = ActiveMapItemActions.setVisibility({visible: visibility, activeMapItem: activeMapItem});
      const state = reducer(existingState, action);

      expect(state.items.length).toBe(existingState.items.length);
      expect(state.items).toEqual(existingState.items);
    });
  });

  describe('setSublayerVisibility', () => {
    it('sets the visibility for the layer (assumption: it is already in the state)', () => {
      const expectedVisibility = false;
      const expectedActiveMapItem = createGb2WmsMapItemMock('new unique item', 3, true);
      const expectedLayerId = expectedActiveMapItem.settings.layers[1].id;
      existingState.items.splice(2, 0, expectedActiveMapItem);
      const action = ActiveMapItemActions.setSublayerVisibility({
        visible: expectedVisibility,
        activeMapItem: expectedActiveMapItem,
        layerId: expectedLayerId,
      });
      const state = reducer(existingState, action);

      expect(state.items.length).toBe(existingState.items.length);
      const actualItem = state.items.find((item) => item.id === expectedActiveMapItem.id) as Gb2WmsActiveMapItem;
      const actualLayer = actualItem.settings.layers.find((layer) => layer.id === expectedLayerId);
      expect(actualLayer).toBeDefined();
      expect(actualLayer!.visible).toBe(expectedVisibility);
    });

    it('does not set anything if the item is not in the state', () => {
      const visibility = false;
      const activeMapItem = createGb2WmsMapItemMock('new unique item', 3);
      const action = ActiveMapItemActions.setSublayerVisibility({
        visible: visibility,
        activeMapItem: activeMapItem,
        layerId: activeMapItem.settings.layers[1].id,
      });
      const state = reducer(existingState, action);

      expect(state.items.length).toBe(existingState.items.length);
      expect(state.items).toEqual(existingState.items);
    });
  });

  describe('setLoadingState', () => {
    it('sets the loading state for the item (assumption: it is already in the state)', () => {
      const expectedLoadingState: LoadingState = 'loading';
      const expectedActiveMapItem = createGb2WmsMapItemMock('new unique item', 0, false, 0.123);
      existingState.items.splice(2, 0, expectedActiveMapItem);
      const action = ActiveMapItemActions.setLoadingState({loadingState: expectedLoadingState, id: expectedActiveMapItem.id});
      const state = reducer(existingState, action);

      expect(state.items.length).toBe(existingState.items.length);
      const actualItem = state.items.find((item) => item.id === expectedActiveMapItem.id);
      expect(actualItem).toBeDefined();
      expect(actualItem!.loadingState).toBe(expectedLoadingState);
    });
  });

  describe('setViewProcessState', () => {
    it('sets the view process state for the item (assumption: it is already in the state)', () => {
      const expectedViewProcessState: ViewProcessState = 'updating';
      const expectedActiveMapItem = createGb2WmsMapItemMock('new unique item', 0, false, 0.123);
      existingState.items.splice(2, 0, expectedActiveMapItem);
      const action = ActiveMapItemActions.setViewProcessState({viewProcessState: expectedViewProcessState, id: expectedActiveMapItem.id});
      const state = reducer(existingState, action);

      expect(state.items.length).toBe(existingState.items.length);
      const actualItem = state.items.find((item) => item.id === expectedActiveMapItem.id);
      expect(actualItem).toBeDefined();
      expect(actualItem!.viewProcessState).toBe(expectedViewProcessState);
    });
  });

  describe('reorderActiveMapItem', () => {
    it('reorders the map items', () => {
      const previousPosition = 1;
      const currentPosition = 3;
      const action = ActiveMapItemActions.reorderActiveMapItem({previousPosition, currentPosition});
      const state = reducer(existingState, action);

      expect(state.items.length).toBe(existingState.items.length);
      expect(state.items).toEqual(jasmine.arrayWithExactContents(existingState.items));
      expect(state.items[currentPosition]).toEqual(existingState.items[previousPosition]);
    });
  });

  describe('reorderSublayer', () => {
    it('reorders the map item layers', () => {
      const previousPosition = 42;
      const currentPosition = 69;
      const activeMapItem = createGb2WmsMapItemMock('new unique item', 100);
      existingState.items.push(activeMapItem);
      const action = ActiveMapItemActions.reorderSublayer({activeMapItem, previousPosition, currentPosition});
      const state = reducer(existingState, action);

      expect(state.items.length).toBe(existingState.items.length);
      expect(state.items.map((item) => item.id)).toEqual(existingState.items.map((item) => item.id));
      const actualLayers = state.items.filter(isActiveMapItemOfType(Gb2WmsActiveMapItem)).find((item) => activeMapItem.id === item.id)
        ?.settings.layers;
      expect(actualLayers).toBeDefined();
      expect(actualLayers!.length).toBe(activeMapItem.settings.layers.length);
      expect(actualLayers).toEqual(jasmine.arrayWithExactContents(activeMapItem.settings.layers));
      expect(actualLayers![currentPosition]).toEqual(activeMapItem.settings.layers[previousPosition]);
    });
  });

  describe('setAttributeFilterValueState', () => {
    const filterConfigurationsMock: FilterConfiguration[] = [
      {
        name: 'Anzeigeoptionen nach Hauptnutzung',
        parameter: 'FILTER_GEBART',
        filterValues: [
          {
            name: 'Wohnen',
            values: ['Gebäude Wohnen'],
            isActive: true,
          },
          {
            name: 'Gewerbe und Verwaltung',
            values: ['Gebäude Landwirtschaft', 'Gebäude Industrie', 'Gebäude Verwaltung'],
            isActive: true,
          },
          {
            name: 'Andere',
            values: ['Nebengebäude', 'Gebäude Handel', 'Gebäude Gastgewerbe', 'Gebäude Verkehrswesen', 'unbekannt'],
            isActive: false,
          },
        ],
      },
    ];
    const mapMock = {id: 'test', title: 'test_title', layers: [], filterConfigurations: filterConfigurationsMock} as Partial<Map>;

    it('sets the attribute filter value state to the map item', () => {
      const activeMapItem = ActiveMapItemFactory.createGb2WmsMapItem(<Map>mapMock);
      existingState.items.push(activeMapItem);
      const expectedIsFilterValueActive = false;
      const filterConfig = {
        isFilterValueActive: expectedIsFilterValueActive,
        filterValueName: 'Gewerbe und Verwaltung',
        attributeFilterParameter: 'FILTER_GEBART',
        activeMapItem: activeMapItem,
      };
      const action = ActiveMapItemActions.setAttributeFilterValueState(filterConfig);
      const state = reducer(existingState, action);

      expect(state.items.length).toBe(existingState.items.length);
      const actualMapItem = state.items.filter(isActiveMapItemOfType(Gb2WmsActiveMapItem)).find((item) => activeMapItem.id === item.id);
      expect(actualMapItem).toBeDefined();
      expect(actualMapItem!.settings.filterConfigurations).not.toEqual(filterConfigurationsMock);
      const actualFilterValue = actualMapItem!.settings.filterConfigurations
        ?.find((config) => config.parameter === filterConfig.attributeFilterParameter)
        ?.filterValues.find((value) => value.name === filterConfig.filterValueName);
      expect(actualFilterValue).toBeDefined();
      expect(actualFilterValue!.isActive).toBe(expectedIsFilterValueActive);
    });
  });

  describe('addFavourite', () => {
    it('adds the map items from the favourite on top', () => {
      const favouriteActiveMapItems: ActiveMapItem[] = [
        activeMapItemsMock[2], // already existing item
        createGb2WmsMapItemMock('favouriteMapItem'), // completely new item
      ];
      const baseConfig: FavouriteBaseConfig = {
        scale: 1_155_581,
        center: {x: 1336, y: 9000},
        basemap: "It's-A-Me, Zelda!",
      };
      const action = ActiveMapItemActions.addFavourite({activeMapItems: favouriteActiveMapItems, baseConfig, drawingsToAdd: []});
      const state = reducer(existingState, action);

      expect(state.items.length).toBe(existingState.items.length + 1);
      expect(state.items[0]).toEqual(favouriteActiveMapItems[0]);
      expect(state.items[1]).toEqual(favouriteActiveMapItems[1]);
    });
  });

  describe('addInitialMapItems', () => {
    it('adds the initial map items on top', () => {
      const initialMapItems: ActiveMapItem[] = [
        activeMapItemsMock[0], // already existing item
        createGb2WmsMapItemMock('initialMapItemOne'), // completely new item
        createGb2WmsMapItemMock('initialMapItemTwo'), // completely new item
      ];
      const action = ActiveMapItemActions.addInitialMapItems({initialMapItems});
      const state = reducer(existingState, action);

      expect(state.items.length).toBe(existingState.items.length + 2);
      expect(state.items[0]).toEqual(initialMapItems[0]);
      expect(state.items[1]).toEqual(initialMapItems[1]);
      expect(state.items[2]).toEqual(initialMapItems[2]);
    });
  });

  describe('markAllActiveMapItemNoticeAsRead', () => {
    it('marks all notices from GB2WMS items as read', () => {
      expect(
        existingState.items.filter(isActiveMapItemOfType(Gb2WmsActiveMapItem)).some((item) => item.settings.isNoticeMarkedAsRead),
      ).toBeFalse();
      const action = ActiveMapItemActions.markAllActiveMapItemNoticeAsRead();
      const state = reducer(existingState, action);

      expect(state.items.filter(isActiveMapItemOfType(Gb2WmsActiveMapItem)).every((item) => item.settings.isNoticeMarkedAsRead)).toBeTrue();
    });
  });

  describe('replaceActiveMapItem', () => {
    it('replaces the active map item correctly', () => {
      const modifiedActiveMapItem = structuredClone(activeMapItemsMock[1]);
      const modifiedOpacity = activeMapItemsMock[1].opacity + 1337;
      modifiedActiveMapItem.opacity = modifiedOpacity;

      existingState.items = activeMapItemsMock;

      const action = ActiveMapItemActions.replaceActiveMapItem({modifiedActiveMapItem});
      const state = reducer(existingState, action);

      expect((<Gb2WmsActiveMapItem>state.items[1]).opacity).toEqual(modifiedOpacity);
    });
  });
});
