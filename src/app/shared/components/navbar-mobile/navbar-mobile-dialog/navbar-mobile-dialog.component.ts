import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {MainPage} from 'src/app/shared/enums/main-page.enum';
import {selectIsAuthenticated, selectUserName} from 'src/app/state/auth/reducers/auth-status.reducer';
import {AuthStatusActions} from '../../../../state/auth/actions/auth-status.actions';

@Component({
  selector: 'navbar-mobile-dialog',
  templateUrl: './navbar-mobile-dialog.component.html',
  styleUrls: ['./navbar-mobile-dialog.component.scss'],
  standalone: false,
})
export class NavbarMobileDialogComponent implements OnInit, OnDestroy {
  private readonly dialogRef = inject<MatDialogRef<NavbarMobileDialogComponent>>(MatDialogRef);
  private readonly store = inject(Store);

  protected readonly mainPageEnum = MainPage;
  public isAuthenticated: boolean = false;
  public userName?: string;

  private readonly subscriptions = new Subscription();
  private readonly userName$ = this.store.select(selectUserName);
  private readonly isAuthenticated$ = this.store.select(selectIsAuthenticated);

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
    this.store.dispatch(AuthStatusActions.performLogin());
  }

  public logout() {
    this.store.dispatch(AuthStatusActions.performLogout({isForced: false}));
  }

  private initSubscriptions() {
    this.subscriptions.add(this.isAuthenticated$.pipe(tap((value) => (this.isAuthenticated = value))).subscribe());
    this.subscriptions.add(this.userName$.pipe(tap((userName) => (this.userName = userName))).subscribe());
  }
}
