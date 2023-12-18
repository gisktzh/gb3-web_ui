import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {selectUrlState} from 'src/app/state/app/reducers/url.reducer';
import {PanelClass} from '../../enums/panel-class.enum';
import {NavbarMobileDialogComponent} from './navbar-mobile-dialog/navbar-mobile-dialog.component';

@Component({
  selector: 'navbar-mobile',
  templateUrl: './navbar-mobile.component.html',
  styleUrls: ['./navbar-mobile.component.scss'],
})
export class NavbarMobileComponent implements OnInit, OnDestroy {
  public isSimplifiedPage: boolean = false;

  private readonly urlState$ = this.store.select(selectUrlState);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    public dialog: MatDialog,
    private readonly store: Store,
  ) {}

  public ngOnInit() {
    this.subscriptions.add(
      this.urlState$
        .pipe(
          tap(({isSimplifiedPage}) => {
            this.isSimplifiedPage = isSimplifiedPage;
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
      autoFocus: false,
    });
  }
}
