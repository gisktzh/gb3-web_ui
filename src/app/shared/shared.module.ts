import {NgModule} from '@angular/core';
import {MaterialModule} from './external/material.module';
import {BasemapImageLinkPipe} from './pipes/background-map-image-link.pipe';
import {NavbarComponent} from './components/navbar/navbar.component';
import {PlaceholderPageComponent} from './components/placeholder-page/placeholder-page.component';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {LoadingAndProcessBarComponent} from './components/loading-and-process-bar/loading-and-process-bar.component';

@NgModule({
  declarations: [BasemapImageLinkPipe, NavbarComponent, PlaceholderPageComponent, LoadingAndProcessBarComponent],
  imports: [MaterialModule, RouterModule, CommonModule],
  exports: [MaterialModule, BasemapImageLinkPipe, NavbarComponent, LoadingAndProcessBarComponent]
})
export class SharedModule {}
