import {Component} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'gis-browser-teaser',
  templateUrl: './gis-browser-teaser.component.html',
  styleUrls: ['./gis-browser-teaser.component.scss'],
  imports: [MatButton, RouterLink],
})
export class GisBrowserTeaserComponent {}
