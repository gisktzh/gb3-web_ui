import {NgModule} from '@angular/core';
import {MaterialModule} from './external/material.module';
import {BasemapImageLinkPipe} from './pipes/background-map-image-link.pipe';
import {NavbarComponent} from './components/navbar/navbar.component';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {LoadingAndProcessBarComponent} from './components/loading-and-process-bar/loading-and-process-bar.component';
import {HighlightSearchQueryPipe} from './pipes/highlight-search-query.pipe';
import {ResizableModule} from 'angular-resizable-element';
import {ResizeHandlerComponent} from './components/resize-handler/resize-handler.component';
import {DragCursorDirective} from './directives/drag-cursor.directive';
import {MobileWarningComponent} from './components/mobile-warning/mobile-warning.component';
import {FormatContentPipe} from './pipes/format-content.pipe';
import {PageNotificationComponent} from './components/page-notification/page-notification.component';
import {MainFooterComponent} from './components/footer/main-footer.component';
import {ScrollbarWidthCalculationComponent} from './components/scrollbar-width-calculation/scrollbar-width-calculation.component';
import {KeyValuePreserveOrderPipe} from './pipes/key-value-preserve-order.pipe';
import {AppendMapConfigurationToUrlPipe} from './pipes/append-map-configuration-to-url.pipe';
import {LayerTooltipPipe} from './pipes/layer-tooltip.pipe';
import {DescriptiveHighlightedLinkComponent} from './components/descriptive-highlighted-link/descriptive-highlighted-link.component';
import {HeroHeaderComponent} from './components/hero-header/hero-header.component';
import {StartPageSectionComponent} from './components/start-page-section/start-page-section.component';
import {ContactDetailsComponent} from './components/contact-details/contact-details.component';
import {ContactDetailComponent} from './components/contact-details/contact-detail/contact-detail.component';
import {WaitingPageComponent} from './components/waiting-page/waiting-page.component';
import {SliderWrapperComponent} from './components/slider-wrapper/slider-wrapper.component';
import {LinkListComponent} from './components/link-list/link-list.component';
import {LinkListItemComponent} from './components/link-list/link-list-item/link-list-item.component';
import {AccordionItemComponent} from './components/accordion-item/accordion-item.component';
import {SearchComponent} from './components/search/search.component';
import {SearchFilterDialogComponent} from './components/search-filter-dialog/search-filter-dialog.component';

@NgModule({
  declarations: [
    BasemapImageLinkPipe,
    NavbarComponent,
    LoadingAndProcessBarComponent,
    HighlightSearchQueryPipe,
    ResizeHandlerComponent,
    DragCursorDirective,
    MobileWarningComponent,
    FormatContentPipe,
    PageNotificationComponent,
    MainFooterComponent,
    ScrollbarWidthCalculationComponent,
    KeyValuePreserveOrderPipe,
    AppendMapConfigurationToUrlPipe,
    LayerTooltipPipe,
    DescriptiveHighlightedLinkComponent,
    HeroHeaderComponent,
    StartPageSectionComponent,
    ContactDetailsComponent,
    ContactDetailComponent,
    WaitingPageComponent,
    SliderWrapperComponent,
    LinkListComponent,
    LinkListItemComponent,
    AccordionItemComponent,
    SearchComponent,
    SearchFilterDialogComponent,
  ],
  imports: [MaterialModule, RouterModule, CommonModule, ResizableModule],
  exports: [
    MaterialModule,
    ResizableModule,
    BasemapImageLinkPipe,
    NavbarComponent,
    LoadingAndProcessBarComponent,
    HighlightSearchQueryPipe,
    ResizeHandlerComponent,
    DragCursorDirective,
    MobileWarningComponent,
    FormatContentPipe,
    PageNotificationComponent,
    MainFooterComponent,
    ScrollbarWidthCalculationComponent,
    KeyValuePreserveOrderPipe,
    AppendMapConfigurationToUrlPipe,
    LayerTooltipPipe,
    DescriptiveHighlightedLinkComponent,
    HeroHeaderComponent,
    StartPageSectionComponent,
    ContactDetailsComponent,
    WaitingPageComponent,
    SliderWrapperComponent,
    LinkListComponent,
    AccordionItemComponent,
    SearchComponent,
    SearchFilterDialogComponent,
  ],
})
export class SharedModule {}
