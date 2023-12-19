import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {MainPage} from 'src/app/shared/enums/main-page.enum';
import {selectUserName} from 'src/app/state/auth/reducers/auth-status.reducer';
import {AuthService} from '../../../../auth/auth.service';
import {AuthStatusActions} from '../../../../state/auth/actions/auth-status.actions';

@Component({
  selector: 'navbar-mobile-dialog',
  templateUrl: './navbar-mobile-dialog.component.html',
  styleUrls: ['./navbar-mobile-dialog.component.scss'],
})
export class NavbarMobileDialogComponent implements OnInit, OnDestroy {
  protected readonly mainPageEnum = MainPage;
  public isAuthenticated: boolean = false;
  public userName?: string;

  private readonly subscriptions = new Subscription();
  private readonly userName$ = this.store.select(selectUserName);

  constructor(
    private readonly dialogRef: MatDialogRef<NavbarMobileDialogComponent>,
    private readonly authService: AuthService,
    private readonly store: Store,
  ) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public close(isAborted: boolean = false) {
    this.dialogRef.close(isAborted);
  }

  public startLogin() {
    this.authService.login();
  }

  public logout() {
    this.store.dispatch(AuthStatusActions.performLogout({forced: false}));
  }

  private initSubscriptions() {
    this.subscriptions.add(this.authService.isAuthenticated$.pipe(tap((value) => (this.isAuthenticated = value))).subscribe());
    this.subscriptions.add(this.userName$.pipe(tap((userName) => (this.userName = userName))).subscribe());
  }
}
