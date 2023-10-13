import {Component, Renderer2} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {AuthService} from '../../../auth/auth.service';
import {AuthStatusActions} from '../../../state/auth/actions/auth-status.actions';
import {selectUserName} from '../../../state/auth/reducers/auth-status.reducer';
import {MainPage} from '../../enums/main-page.enum';

@Component({
  selector: 'navbar-mobile',
  templateUrl: './navbar-mobile.component.html',
  styleUrls: ['./navbar-mobile.component.scss'],
})
export class NavbarMobileComponent {
  public isVisible: boolean = false;
  public isAuthenticated: boolean = false;
  public userName?: string;

  protected readonly mainPageEnum = MainPage;

  private readonly subscriptions = new Subscription();
  private readonly userName$ = this.store.select(selectUserName);

  constructor(
    private readonly authService: AuthService,
    private readonly store: Store,
    private renderer: Renderer2,
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
  }

  toggleMenu() {
    this.isVisible = !this.isVisible;
  }
}
