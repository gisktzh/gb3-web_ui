import {MainPage} from '../../../shared/enums/main-page.enum';

export interface UrlState {
  mainPage: MainPage | undefined;
  previousPage: MainPage | undefined;
  /**
   * Flag which can be used to completely hide header and footer, e.g. on an iframe page
   */
  isHeadlessPage: boolean;
  /**
   * Flag which can be used to toggle simplified layouts, e.g. no ZH Lion in the header.
   */
  isSimplifiedPage: boolean;
  keepTemporaryUrlParams: boolean;
}
