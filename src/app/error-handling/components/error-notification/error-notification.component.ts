import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_SNACK_BAR_DATA, MatSnackBarRef} from '@angular/material/snack-bar';
import {ErrorNotificationInterface} from '../../interfaces/error-notification.interface';
import {BehaviorSubject, concatMap, interval, Observable, Subscription, tap} from 'rxjs';

const TICK_LENGTH_IN_MS = 100;

@Component({
  selector: 'error-notification',
  templateUrl: './error-notification.component.html',
  styleUrls: ['./error-notification.component.scss'],
  standalone: false,
})
export class ErrorNotificationComponent implements OnInit, OnDestroy {
  public progressbarValue$ = new BehaviorSubject<number>(100);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly snackBarRef: MatSnackBarRef<ErrorNotificationComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public readonly data: ErrorNotificationInterface,
  ) {}

  public ngOnInit() {
    this.subscriptions.add(
      this.snackBarRef
        .afterOpened()
        .pipe(concatMap(() => this.startCountdown()))
        .subscribe(),
    );
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public close() {
    this.snackBarRef.dismiss();
  }

  private startCountdown(): Observable<number> {
    const amountOfTicks = this.data.duration / TICK_LENGTH_IN_MS;
    const tickPercentageLength = 100 / amountOfTicks;

    return interval(TICK_LENGTH_IN_MS).pipe(
      tap(() => {
        const current = this.progressbarValue$.getValue();
        this.progressbarValue$.next(current - tickPercentageLength);
      }),
    );
  }
}
