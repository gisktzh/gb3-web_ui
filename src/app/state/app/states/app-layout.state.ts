import {ScreenMode} from 'src/app/shared/types/screen-size.type';

export interface AppLayoutState {
  scrollbarWidth: number | undefined;
  screenMode: ScreenMode;
}
