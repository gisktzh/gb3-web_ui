import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {AuthNotificationDialogComponent} from './auth-notification-dialog/auth-notification-dialog.component';
import {tap} from 'rxjs';
import {Router} from '@angular/router';

export interface DialogContent {
  title: string;
  text: string;
  forceReload?: boolean;
}

const impendingLogoutDialogContent: DialogContent = {
  title: 'Information',
  text: 'Sie werden in Kürze ausgeloggt. Bitte schliessen Sie aktuelle Arbeiten ab oder starten Sie eine neue Sitzung.'
};
const forcedLogoutDialogContent: DialogContent = {
  title: 'Information',
  text: 'Sie wurden ausgeloggt, da entweder Ihr Login das Ende seiner Gültigkeit erreicht hat oder in einem anderen Tab ein Logout veranlasst wurde.',
  forceReload: true
};

@Injectable({
  providedIn: 'root'
})
export class AuthNotificationService {
  constructor(private readonly matDialogService: MatDialog, private readonly router: Router) {}

  public showImpendingLogoutDialog() {
    this.openDialog(impendingLogoutDialogContent);
  }

  public showForcedLogoutDialog() {
    this.openDialog(forcedLogoutDialogContent);
  }

  private openDialog(content: DialogContent): void {
    const dialogRef = this.matDialogService.open(AuthNotificationDialogComponent, {
      enterAnimationDuration: 150,
      exitAnimationDuration: 150,
      data: content
    });

    if (content.forceReload) {
      dialogRef
        .afterClosed()
        .pipe(tap((_) => this.router.navigate(['/'])))
        .subscribe();
    }
  }
}
