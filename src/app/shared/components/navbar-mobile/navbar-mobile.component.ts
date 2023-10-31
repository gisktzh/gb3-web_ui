import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {NavigationEnd, Router} from '@angular/router';
import {Subscription, tap} from 'rxjs';
import {MainPage} from '../../enums/main-page.enum';
import {PanelClass} from '../../enums/panel-class.enum';
import {NavbarMobileDialogComponent} from './navbar-mobile-dialog/navbar-mobile-dialog.component';

@Component({
  selector: 'navbar-mobile',
  templateUrl: './navbar-mobile.component.html',
  styleUrls: ['./navbar-mobile.component.scss'],
})
export class NavbarMobileComponent implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription = new Subscription();
  public currentMainPage: string = MainPage.Maps;
  protected readonly mainPageEnum = MainPage;

  constructor(
    public dialog: MatDialog,
    private readonly router: Router,
  ) {}

  public ngOnInit() {
    this.subscriptions.add(
      this.router.events
        .pipe(
          tap((event) => {
            if (event instanceof NavigationEnd) {
              const url = event.url;
              this.currentMainPage = url.split('?')[0].split('/')[1];
            }
          }),
        )
        .subscribe(),
    );
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  showMenu() {
    this.dialog.open(NavbarMobileDialogComponent, {
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '100%',
      width: '100%',
      panelClass: PanelClass.ApiWrapperDialog,
    });
  }
}
