import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {ResizableModule} from 'angular-resizable-element';
import {AccordionItemComponent} from './components/accordion-item/accordion-item.component';
import {ContactDetailComponent} from './components/contact-details/contact-detail/contact-detail.component';
import {ContactDetailsComponent} from './components/contact-details/contact-details.component';
import {DescriptiveHighlightedLinkComponent} from './components/descriptive-highlighted-link/descriptive-highlighted-link.component';
import {ExpandableListItemComponent} from './components/expandable-list-item/expandable-list-item.component';
import {MainFooterComponent} from './components/footer/main-footer.component';
import {Gb2ExitButtonComponent} from './components/gb2-exit-button/gb2-exit-button.component';
import {HeroHeaderComponent} from './components/hero-header/hero-header.component';
import {LinkListItemComponent} from './components/link-list/link-list-item/link-list-item.component';
import {LinkListComponent} from './components/link-list/link-list.component';
import {LoadingAndProcessBarComponent} from './components/loading-and-process-bar/loading-and-process-bar.component';
import {MobileWarningComponent} from './components/mobile-warning/mobile-warning.component';
import {NavbarMobileDialogComponent} from './components/navbar-mobile/navbar-mobile-dialog/navbar-mobile-dialog.component';
import {NavbarMobileComponent} from './components/navbar-mobile/navbar-mobile.component';
import {NavbarComponent} from './components/navbar/navbar.component';
import {PageNotificationComponent} from './components/page-notification/page-notification.component';
import {ResizeHandlerComponent} from './components/resize-handler/resize-handler.component';
import {ScrollbarWidthCalculationComponent} from './components/scrollbar-width-calculation/scrollbar-width-calculation.component';
import {SearchFilterDialogComponent} from './components/search-filter-dialog/search-filter-dialog.component';
import {SearchComponent} from './components/search/search.component';
import {SliderWrapperComponent} from './components/slider-wrapper/slider-wrapper.component';
import {StartPageSectionComponent} from './components/start-page-section/start-page-section.component';
import {WaitingPageComponent} from './components/waiting-page/waiting-page.component';
import {DragCursorDirective} from './directives/drag-cursor.directive';
import {MaterialModule} from './external/material.module';
import {AppendMapConfigurationToUrlPipe} from './pipes/append-map-configuration-to-url.pipe';
import {BasemapImageLinkPipe} from './pipes/background-map-image-link.pipe';
import {FormatContentPipe} from './pipes/format-content.pipe';
import {HighlightSearchQueryPipe} from './pipes/highlight-search-query.pipe';
import {KeyValuePreserveOrderPipe} from './pipes/key-value-preserve-order.pipe';
import {LayerTooltipPipe} from './pipes/layer-tooltip.pipe';
import {ExpandableListItemHeaderComponent} from './components/expandable-list-item/expandable-list-item-header/expandable-list-item-header.component';

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
    Gb2ExitButtonComponent,
    NavbarMobileComponent,
    NavbarMobileDialogComponent,
    ExpandableListItemComponent,
    ExpandableListItemHeaderComponent,
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
    Gb2ExitButtonComponent,
    NavbarMobileComponent,
    ExpandableListItemComponent,
  ],
})
export class SharedModule {}
