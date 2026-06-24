import {Component, inject} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {MainPage} from 'src/app/shared/enums/main-page.enum';
import {selectIsAuthenticated, selectUserName} from 'src/app/state/auth/reducers/auth-status.reducer';
import {AuthStatusActions} from '../../../../state/auth/actions/auth-status.actions';
import {MatCard, MatCardHeader, MatCardContent} from '@angular/material/card';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatMenuTrigger, MatMenu, MatMenuItem} from '@angular/material/menu';
import {MatDivider} from '@angular/material/divider';
import {RouterLinkActive, RouterLink} from '@angular/router';
import {FeatureFlagDirective} from '../../../directives/feature-flag.directive';

@Component({
  selector: 'navbar-mobile-dialog',
  templateUrl: './navbar-mobile-dialog.component.html',
  styleUrls: ['./navbar-mobile-dialog.component.scss'],
  imports: [
    MatCard,
    MatCardHeader,
    MatButton,
    MatIcon,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    MatDivider,
    MatIconButton,
    MatCardContent,
    RouterLinkActive,
    RouterLink,
    FeatureFlagDirective,
  ],
})
export class NavbarMobileDialogComponent {
  private readonly dialogRef = inject<MatDialogRef<NavbarMobileDialogComponent>>(MatDialogRef);
  private readonly store = inject(Store);

  protected readonly mainPageEnum = MainPage;
  public readonly isAuthenticated = this.store.selectSignal(selectIsAuthenticated);
  public readonly userName = this.store.selectSignal(selectUserName);

  public close(isAborted: boolean = false) {
    this.dialogRef.close(isAborted);
  }

  public startLogin() {
    this.store.dispatch(AuthStatusActions.performLogin());
  }

  public logout() {
    this.store.dispatch(AuthStatusActions.performLogout({isForced: false}));
  }
}
