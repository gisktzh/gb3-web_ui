import {NgModule} from '@angular/core';
import {MaterialModule} from './external/material.module';
import {BasemapImageLinkPipe} from './pipes/background-map-image-link.pipe';
import {NavbarComponent} from './components/navbar/navbar.component';
import {PlaceholderPageComponent} from './components/placeholder-page/placeholder-page.component';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';

@NgModule({
  declarations: [BasemapImageLinkPipe, NavbarComponent, PlaceholderPageComponent],
  imports: [MaterialModule, RouterModule, CommonModule],
  exports: [MaterialModule, BasemapImageLinkPipe, NavbarComponent]
})
export class SharedModule {}
