import {ScreenHeight} from 'src/app/shared/types/screen-height-type';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';

export interface AppLayoutState {
  scrollbarWidth: number | undefined;
  screenMode: ScreenMode;
  screenHeight: ScreenHeight;
}
