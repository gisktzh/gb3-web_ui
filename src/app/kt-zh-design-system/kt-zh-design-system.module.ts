import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {KtzhSliderWrapperComponent} from './components/ktzh-slider-wrapper/ktzh-slider-wrapper.component';

@NgModule({
  declarations: [KtzhSliderWrapperComponent],
  imports: [SharedModule],
  exports: [KtzhSliderWrapperComponent]
})
export class KtZhDesignSystemModule {}
