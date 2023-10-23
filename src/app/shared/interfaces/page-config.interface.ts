import {MainPage} from '../enums/main-page.enum';

export interface PageConfig {
  useSimplifiedPageOn: MainPage[];
  useHeadlessPageOn: MainPage[];
}
