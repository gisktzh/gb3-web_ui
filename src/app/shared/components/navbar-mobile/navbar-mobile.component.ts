import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {selectUrlState} from 'src/app/state/app/reducers/url.reducer';
import {PanelClass} from '../../enums/panel-class.enum';
import {NavbarMobileDialogComponent} from './navbar-mobile-dialog/navbar-mobile-dialog.component';
import {MatToolbar} from '@angular/material/toolbar';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'navbar-mobile',
  templateUrl: './navbar-mobile.component.html',
  styleUrls: ['./navbar-mobile.component.scss'],
  imports: [MatToolbar, MatButton, MatIcon, MatIconButton],
})
export class NavbarMobileComponent implements OnInit, OnDestroy {
  private readonly dialog = inject(MatDialog);
  private readonly store = inject(Store);

  public isSimplifiedPage: boolean = false;

  private readonly urlState$ = this.store.select(selectUrlState);
  private readonly subscriptions: Subscription = new Subscription();

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
  }
}
