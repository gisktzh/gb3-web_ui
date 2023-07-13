import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router, Scroll} from '@angular/router';
import {filter, Subscription, tap} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'data-catalogue-page',
  templateUrl: './data-catalogue-page.component.html',
  styleUrls: ['./data-catalogue-page.component.scss'],
})
export class DataCataloguePageComponent implements OnInit, OnDestroy {
  public isIndex: boolean = true;
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly router: Router) {}

  public ngOnInit() {
    // todo: this ugly hack is only used until we remove the image. This will also remove the checks in the HTML template.
    this.subscriptions.add(
      this.router.events
        .pipe(
          filter((evt) => evt instanceof Scroll),
          map((evt) => evt as Scroll),
          tap((scroll) => {
            this.isIndex = scroll.routerEvent.url === '/data';
          })
        )
        .subscribe()
    );
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
