import {Component, inject, input} from '@angular/core';
import {Store} from '@ngrx/store';
import {AuthStatusActions} from '../../../state/auth/actions/auth-status.actions';
import {selectIsAuthenticated, selectUserName} from '../../../state/auth/reducers/auth-status.reducer';
import {MainPage} from '../../enums/main-page.enum';
import {selectScreenMode, selectScrollbarWidth} from '../../../state/app/reducers/app-layout.reducer';
import {NavbarMobileDialogComponent} from '../navbar-mobile/navbar-mobile-dialog/navbar-mobile-dialog.component';
import {PanelClass} from '../../enums/panel-class.enum';
import {MatDialog} from '@angular/material/dialog';
import {MatToolbar} from '@angular/material/toolbar';
import {NgOptimizedImage} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {RouterLinkActive, RouterLink} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {FeatureFlagDirective} from '../../directives/feature-flag.directive';
import {MatDivider} from '@angular/material/divider';
import {MatMenuTrigger, MatMenu, MatMenuItem} from '@angular/material/menu';

@Component({
  selector: 'navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [
    MatToolbar,
    NgOptimizedImage,
    MatButton,
    RouterLinkActive,
    RouterLink,
    MatIcon,
    FeatureFlagDirective,
    MatDivider,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
  ],
})
export class NavbarComponent {
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);

  public readonly isSimplifiedPage = input(false);

  public readonly isAuthenticated = this.store.selectSignal(selectIsAuthenticated);
  public readonly userName = this.store.selectSignal(selectUserName);
  public readonly scrollbarWidth = this.store.selectSignal(selectScrollbarWidth);
  public readonly screenMode = this.store.selectSignal(selectScreenMode);

  protected readonly mainPageEnum = MainPage;

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
}
