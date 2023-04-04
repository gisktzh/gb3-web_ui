import {NgModule} from '@angular/core';
import {MaterialModule} from './external/material.module';
import {BasemapImageLinkPipe} from './pipes/background-map-image-link.pipe';
import {NavbarComponent} from './components/navbar/navbar.component';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {LoadingAndProcessBarComponent} from './components/loading-and-process-bar/loading-and-process-bar.component';
import {HighlightSearchQueryPipe} from './pipes/highlight-search-query.pipe';
import {LinkListComponent} from './components/link-list/link-list.component';

@NgModule({
  declarations: [BasemapImageLinkPipe, NavbarComponent, LoadingAndProcessBarComponent, HighlightSearchQueryPipe, LinkListComponent],
  imports: [MaterialModule, RouterModule, CommonModule],
  exports: [
    MaterialModule,
    BasemapImageLinkPipe,
    NavbarComponent,
    LoadingAndProcessBarComponent,
    HighlightSearchQueryPipe,
    LinkListComponent
  ]
})
export class SharedModule {}
