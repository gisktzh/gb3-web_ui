import {initialState, reducer} from './url.reducer';
import {UrlActions} from '../actions/url.actions';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {UrlState} from '../states/url.state';

describe('UrlReducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;
      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  describe('setUrl', () => {
    it('correctly sets the values from the action and previus state', () => {
      const props = {mainPage: MainPage.Data, isSimplifiedPage: true, isHeadlessPage: true};
      const action = UrlActions.setPage(props);
      const mockState: UrlState = {...initialState, previousPage: MainPage.Maps};

      const result = reducer(mockState, action);

      expect(result.mainPage).toBe(props.mainPage);
      expect(result.isHeadlessPage).toBe(props.isHeadlessPage);
      expect(result.isSimplifiedPage).toBe(props.isSimplifiedPage);
      expect(result.previousPage).toBe(mockState.mainPage);
    });
  });
});
