import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {KtzhSliderWrapperComponent} from './components/ktzh-slider-wrapper/ktzh-slider-wrapper.component';
import {CommonModule} from '@angular/common';
import {KtzhLinkListComponent} from './components/ktzh-link-list/ktzh-link-list.component';

@NgModule({
  declarations: [KtzhSliderWrapperComponent, KtzhLinkListComponent],
  imports: [CommonModule, SharedModule],
  exports: [KtzhSliderWrapperComponent, KtzhLinkListComponent]
})
export class KtZhDesignSystemModule {}
