import {Component, Input, OnDestroy, OnInit, inject} from '@angular/core';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {AuthStatusActions} from '../../../state/auth/actions/auth-status.actions';
import {selectIsAuthenticated, selectUserName} from '../../../state/auth/reducers/auth-status.reducer';
import {MainPage} from '../../enums/main-page.enum';
import {selectScreenMode, selectScrollbarWidth} from '../../../state/app/reducers/app-layout.reducer';
import {ScreenMode} from '../../types/screen-size.type';
import {NavbarMobileDialogComponent} from '../navbar-mobile/navbar-mobile-dialog/navbar-mobile-dialog.component';
import {PanelClass} from '../../enums/panel-class.enum';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: false,
})
export class NavbarComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);

  @Input() public isSimplifiedPage: boolean = false;

  public isAuthenticated: boolean = false;
  public userName?: string;
  public scrollbarWidth: number = 0;
  public screenMode: ScreenMode = 'regular';

  protected readonly mainPageEnum = MainPage;

  private readonly subscriptions = new Subscription();
  private readonly userName$ = this.store.select(selectUserName);
  private readonly scrollbarWidth$ = this.store.select(selectScrollbarWidth);
  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly isAuthenticated$ = this.store.select(selectIsAuthenticated);

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public startLogin() {
    this.store.dispatch(AuthStatusActions.performLogin());
  }

  public logout() {
    this.store.dispatch(AuthStatusActions.performLogout({isForced: false}));
  }

  public showMenu() {
    this.dialog.open(NavbarMobileDialogComponent, {
      position: {top: '0', right: '0'},
      maxWidth: '433px',
      maxHeight: '100vh',
      height: '100%',
      width: '100%',
      panelClass: PanelClass.ApiWrapperDialog,
      autoFocus: false,
      hasBackdrop: false,
    });
  }

  private initSubscriptions() {
    this.subscriptions.add(this.isAuthenticated$.pipe(tap((isAuthenticated) => (this.isAuthenticated = isAuthenticated))).subscribe());
    this.subscriptions.add(this.userName$.pipe(tap((userName) => (this.userName = userName))).subscribe());
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
    this.subscriptions.add(
      this.scrollbarWidth$
        .pipe(
          tap((scrollbarWidth) => {
            // this is necessary to prevent an error (NG0100: ExpressionChangedAfterItHasBeenCheckedError) as the value usually gets updated so fast
            // that the UI update cycle was not yet fully completed.
            setTimeout(() => (this.scrollbarWidth = scrollbarWidth ?? 0));
          }),
        )
        .subscribe(),
    );
  }
}
