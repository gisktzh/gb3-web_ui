import {Component} from '@angular/core';
import {PageSectionComponent} from '../../../shared/components/page-section/page-section.component';
import {HeroHeaderComponent} from '../../../shared/components/hero-header/hero-header.component';
import {DescriptiveHighlightedLinkComponent} from '../../../shared/components/descriptive-highlighted-link/descriptive-highlighted-link.component';
import {MatIconButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'not-found-error-page',
  templateUrl: './not-found-error-page.component.html',
  styleUrls: ['./not-found-error-page.component.scss'],
  imports: [PageSectionComponent, HeroHeaderComponent, DescriptiveHighlightedLinkComponent, MatIconButton, RouterLink, MatIcon],
})
export class NotFoundErrorPageComponent {}
