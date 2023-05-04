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

@NgModule({
  declarations: [
    BasemapImageLinkPipe,
    NavbarComponent,
    LoadingAndProcessBarComponent,
    HighlightSearchQueryPipe,
    ResizeHandlerComponent,
    DragCursorDirective,
    MobileWarningComponent
  ],
  imports: [MaterialModule, RouterModule, CommonModule, ResizableModule],
  exports: [
    MaterialModule,
    BasemapImageLinkPipe,
    NavbarComponent,
    LoadingAndProcessBarComponent,
    HighlightSearchQueryPipe,
    ResizableModule,
    ResizeHandlerComponent,
    DragCursorDirective,
    MobileWarningComponent
  ]
})
export class SharedModule {}
