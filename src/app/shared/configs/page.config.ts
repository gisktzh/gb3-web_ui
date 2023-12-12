import {PageConfig} from '../interfaces/page-config.interface';
import {MainPage} from '../enums/main-page.enum';

export const pageConfig: PageConfig = {
  useSimplifiedPageOn: [MainPage.Maps],
  useHeadlessPageOn: [MainPage.Embedded, MainPage.Error],
};
