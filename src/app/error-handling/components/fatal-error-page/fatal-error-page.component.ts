import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription, tap} from 'rxjs';

@Component({
  selector: 'fatal-error-page',
  templateUrl: './fatal-error-page.component.html',
  styleUrls: ['./fatal-error-page.component.scss'],
})
export class FatalErrorPageComponent implements OnInit, OnDestroy {
  public errorMessage: string | null = null;

  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly route: ActivatedRoute) {}

  public ngOnInit() {
    this.subscriptions.add(
      this.route.queryParamMap
        .pipe(
          tap((params) => {
            this.errorMessage = params.get('error');
          }),
        )
        .subscribe(),
    );
  }

  public forceRefresh() {
    window.location.href = '/';
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
