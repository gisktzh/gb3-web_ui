import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../../../auth/auth.service';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {AuthStatusActions} from '../../../state/auth/actions/auth-status.actions';
import {selectUserName} from '../../../state/auth/reducers/auth-status.reducer';
import {MainPage} from '../../enums/main-page.enum';
import {selectScreenMode} from '../../../state/app/reducers/app-layout.reducer';
import {ScreenMode} from '../../types/screen-size.type';

@Component({
  selector: 'navbar-mobile',
  templateUrl: './navbar-mobile.component.html',
  styleUrls: ['./navbar-mobile.component.scss'],
})
export class NavbarMobileComponent {
  public isVisible: boolean = false;
  public isAuthenticated: boolean = false;
  public userName?: string;
  public screenMode: ScreenMode = 'mobile';

  protected readonly mainPageEnum = MainPage;

  private readonly subscriptions = new Subscription();
  private readonly userName$ = this.store.select(selectUserName);
  private readonly screenMode$ = this.store.select(selectScreenMode);

  constructor(
    private readonly authService: AuthService,
    private readonly store: Store,
  ) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
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
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
  }

  toggleMenu() {
    this.isVisible = !this.isVisible;
  }
}
