import {UrlConfig} from '../interfaces/url-config.interface';
import {MainPage} from '../enums/main-page.enum';

export const urlConfig: UrlConfig = {
  useSimplifiedPageOn: [MainPage.Maps],
  useHeadlessPageOn: [MainPage.Embedded],
};
