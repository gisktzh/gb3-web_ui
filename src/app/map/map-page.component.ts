import {Component, OnInit} from '@angular/core';
import {UrlService} from '../shared/services/url.service';

@Component({
  selector: 'map-page',
  templateUrl: './map-page.component.html',
  styleUrls: ['./map-page.component.scss']
})
export class MapPageComponent implements OnInit {
  constructor(private readonly urlService: UrlService) {}

  public ngOnInit() {
    this.urlService.getInitialMapConfiguration();
  }
}
