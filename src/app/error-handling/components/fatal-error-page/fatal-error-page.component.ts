import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Subscription, tap} from 'rxjs';

@Component({
  selector: 'fatal-error-page',
  templateUrl: './fatal-error-page.component.html',
  styleUrls: ['./fatal-error-page.component.scss'],
  standalone: false,
})
export class FatalErrorPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);

  public errorMessage: string | null = null;

  private readonly subscriptions: Subscription = new Subscription();

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
