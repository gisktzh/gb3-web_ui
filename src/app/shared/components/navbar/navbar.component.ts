import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../../../auth/auth.service';
import {Subscription, tap} from 'rxjs';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  public isAuthenticated: boolean = false;
  private readonly subscriptions = new Subscription();

  constructor(private readonly authService: AuthService) {}

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
    this.authService.logout();
  }

  private initSubscriptions() {
    this.subscriptions.add(this.authService.isAuthenticated$.pipe(tap((value) => (this.isAuthenticated = value))).subscribe());
  }
}
