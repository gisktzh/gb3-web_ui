import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {selectUrlState} from 'src/app/state/app/reducers/url.reducer';
import {PanelClass} from '../../enums/panel-class.enum';
import {NavbarMobileDialogComponent} from './navbar-mobile-dialog/navbar-mobile-dialog.component';
import {selectDevMode} from '../../../state/app/reducers/app.reducer';

@Component({
  selector: 'navbar-mobile',
  templateUrl: './navbar-mobile.component.html',
  styleUrls: ['./navbar-mobile.component.scss'],
  standalone: false,
})
export class NavbarMobileComponent implements OnInit, OnDestroy {
  public isSimplifiedPage: boolean = false;
  public isDevModeActive: boolean = false;

  private readonly urlState$ = this.store.select(selectUrlState);
  private readonly devMode$ = this.store.select(selectDevMode);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    public dialog: MatDialog,
    private readonly store: Store,
  ) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public showMenu() {
    this.dialog.open(NavbarMobileDialogComponent, {
      maxWidth: '100vw',
      maxHeight: '100vh',
      height: '100%',
      width: '100%',
      panelClass: PanelClass.ApiWrapperDialog,
      autoFocus: false,
    });
  }

  private initSubscriptions() {
    this.subscriptions.add(this.urlState$.pipe(tap(({isSimplifiedPage}) => (this.isSimplifiedPage = isSimplifiedPage))).subscribe());
    this.subscriptions.add(this.devMode$.pipe(tap((devMode) => (this.isDevModeActive = devMode))).subscribe());
  }
}
