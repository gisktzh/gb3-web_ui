import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../../../auth/auth.service';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {AuthStatusActions} from '../../../state/auth/actions/auth-status.actions';
import {selectUserName} from '../../../state/auth/reducers/auth-status.reducer';
import {MainPage} from '../../enums/main-page.enum';
import {selectScrollbarWidth} from '../../../state/app/reducers/app-layout.reducer';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  /** expose the enum to the HTML */
  public readonly mainPageEnum = MainPage;

  @Input() public isSimplifiedPage: boolean = false;
  public isAuthenticated: boolean = false;
  public userName?: string;
  public scrollbarWidth: number = 0;

  private readonly subscriptions = new Subscription();
  private readonly userName$ = this.store.select(selectUserName);
  private readonly scrollbarWidth$ = this.store.select(selectScrollbarWidth);

  constructor(private readonly authService: AuthService, private readonly store: Store) {}

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
    this.subscriptions.add(this.scrollbarWidth$.pipe(tap((scrollbarWidth) => (this.scrollbarWidth = scrollbarWidth ?? 0))).subscribe());
  }
}
