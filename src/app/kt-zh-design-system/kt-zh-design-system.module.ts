import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {KtzhSliderWrapperComponent} from './components/ktzh-slider-wrapper/ktzh-slider-wrapper.component';
import {CommonModule} from '@angular/common';

@NgModule({
  declarations: [KtzhSliderWrapperComponent],
  imports: [CommonModule, SharedModule],
  exports: [KtzhSliderWrapperComponent]
})
export class KtZhDesignSystemModule {}
