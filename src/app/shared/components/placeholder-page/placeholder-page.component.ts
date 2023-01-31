import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {tap} from 'rxjs';

@Component({
  selector: 'placeholder-page-page',
  templateUrl: './placeholder-page.component.html',
  styleUrls: ['./placeholder-page.component.scss']
})
export class PlaceholderPageComponent implements OnInit {
  public activatedRoute$;
  constructor(private readonly activatedRoute: ActivatedRoute) {
    this.activatedRoute$ = this.activatedRoute.url;
  }

  public ngOnInit() {}
}
