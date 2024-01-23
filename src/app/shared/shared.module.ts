import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {ResizableModule} from 'angular-resizable-element';
import {AccordionItemComponent} from './components/accordion-item/accordion-item.component';
import {ContactDetailComponent} from './components/contact-details/contact-detail/contact-detail.component';
import {ContactDetailsComponent} from './components/contact-details/contact-details.component';
import {DescriptiveHighlightedLinkComponent} from './components/descriptive-highlighted-link/descriptive-highlighted-link.component';
import {ExpandableListItemHeaderComponent} from './components/expandable-list-item/expandable-list-item-header/expandable-list-item-header.component';
import {ExpandableListItemComponent} from './components/expandable-list-item/expandable-list-item.component';
import {MainFooterComponent} from './components/footer/main-footer.component';
import {ExternalLinkButtonComponent} from './components/external-link-button/external-link-button.component';
import {HeroHeaderComponent} from './components/hero-header/hero-header.component';
import {LinkListItemComponent} from './components/link-list/link-list-item/link-list-item.component';
import {LinkListComponent} from './components/link-list/link-list.component';
import {LoadingAndProcessBarComponent} from './components/loading-and-process-bar/loading-and-process-bar.component';
import {NavbarMobileDialogComponent} from './components/navbar-mobile/navbar-mobile-dialog/navbar-mobile-dialog.component';
import {NavbarMobileComponent} from './components/navbar-mobile/navbar-mobile.component';
import {NavbarComponent} from './components/navbar/navbar.component';
import {PageNotificationComponent} from './components/page-notification/page-notification.component';
import {ResizeHandlerComponent} from './components/resize-handler/resize-handler.component';
import {ScrollbarWidthCalculationComponent} from './components/scrollbar-width-calculation/scrollbar-width-calculation.component';
import {SearchFilterDialogComponent} from './components/search-filter-dialog/search-filter-dialog.component';
import {SearchComponent} from './components/search/search.component';
import {SliderWrapperComponent} from './components/slider-wrapper/slider-wrapper.component';
import {PageSectionComponent} from './components/page-section/page-section.component';
import {WaitingPageComponent} from './components/waiting-page/waiting-page.component';
import {DragCursorDirective} from './directives/drag-cursor.directive';
import {ShowTooltipIfTruncatedDirective} from './directives/show-tooltip-if-truncated.directive';
import {MaterialModule} from './external/material.module';
import {AppendMapConfigurationToUrlPipe} from './pipes/append-map-configuration-to-url.pipe';
import {BasemapImageLinkPipe} from './pipes/background-map-image-link.pipe';
import {FormatContentPipe} from './pipes/format-content.pipe';
import {HighlightSearchQueryPipe} from './pipes/highlight-search-query.pipe';
import {KeyValuePreserveOrderPipe} from './pipes/key-value-preserve-order.pipe';
import {LayerTooltipPipe} from './pipes/layer-tooltip.pipe';
import {ClickOnSpaceBarDirective} from './directives/click-on-spacebar.directive';
import {Gb2ExitButtonComponent} from './components/external-link-button/gb2-exit-button.component';
import {TypedTourAnchorDirective} from './directives/typed-tour-anchor.directive';

@NgModule({
  declarations: [
    BasemapImageLinkPipe,
    NavbarComponent,
    LoadingAndProcessBarComponent,
    HighlightSearchQueryPipe,
    ResizeHandlerComponent,
    DragCursorDirective,
    FormatContentPipe,
    PageNotificationComponent,
    MainFooterComponent,
    ScrollbarWidthCalculationComponent,
    KeyValuePreserveOrderPipe,
    AppendMapConfigurationToUrlPipe,
    LayerTooltipPipe,
    DescriptiveHighlightedLinkComponent,
    HeroHeaderComponent,
    PageSectionComponent,
    ContactDetailsComponent,
    ContactDetailComponent,
    WaitingPageComponent,
    SliderWrapperComponent,
    LinkListComponent,
    LinkListItemComponent,
    AccordionItemComponent,
    SearchComponent,
    SearchFilterDialogComponent,
    ExternalLinkButtonComponent,
    NavbarMobileComponent,
    NavbarMobileDialogComponent,
    ExpandableListItemComponent,
    ExpandableListItemHeaderComponent,
    ShowTooltipIfTruncatedDirective,
    ClickOnSpaceBarDirective,
    Gb2ExitButtonComponent,
    TypedTourAnchorDirective,
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
    FormatContentPipe,
    PageNotificationComponent,
    MainFooterComponent,
    ScrollbarWidthCalculationComponent,
    KeyValuePreserveOrderPipe,
    AppendMapConfigurationToUrlPipe,
    LayerTooltipPipe,
    DescriptiveHighlightedLinkComponent,
    HeroHeaderComponent,
    PageSectionComponent,
    ContactDetailsComponent,
    WaitingPageComponent,
    SliderWrapperComponent,
    LinkListComponent,
    LinkListItemComponent,
    AccordionItemComponent,
    SearchComponent,
    SearchFilterDialogComponent,
    ExternalLinkButtonComponent,
    NavbarMobileComponent,
    ExpandableListItemComponent,
    ShowTooltipIfTruncatedDirective,
    ClickOnSpaceBarDirective,
    Gb2ExitButtonComponent,
    TypedTourAnchorDirective,
  ],
})
export class SharedModule {}
