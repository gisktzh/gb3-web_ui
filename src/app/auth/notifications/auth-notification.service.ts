import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {AuthNotificationDialogComponent} from './auth-notification-dialog/auth-notification-dialog.component';
import {tap} from 'rxjs';

export interface DialogContent {
  title: string;
  text: string;
  forceReload?: boolean;
  forceCloseOthers?: boolean;
}

const impendingLogoutDialogContent: DialogContent = {
  title: 'Information',
  text: 'Sie werden in Kürze ausgeloggt. Bitte schliessen Sie aktuelle Arbeiten ab oder starten Sie eine neue Sitzung.',
};
const forcedLogoutDialogContent: DialogContent = {
  title: 'Information',
  text: 'Sie wurden ausgeloggt, da entweder Ihr Login das Ende seiner Gültigkeit erreicht hat oder in einem anderen Tab ein Logout veranlasst wurde.',
  forceReload: true,
  forceCloseOthers: true,
};
const programmaticLogoutDialogContent: DialogContent = {
  title: 'Information',
  text: 'Sie wurden ausgeloggt.',
  forceReload: true,
  forceCloseOthers: true,
};

@Injectable({
  providedIn: 'root',
})
export class AuthNotificationService {
  constructor(private readonly matDialogService: MatDialog) {}

  public showImpendingLogoutDialog() {
    this.openDialog(impendingLogoutDialogContent);
  }

  public showForcedLogoutDialog() {
    this.openDialog(forcedLogoutDialogContent);
  }

  public showProgrammaticLogoutDialog() {
    this.openDialog(programmaticLogoutDialogContent);
  }

  private openDialog(content: DialogContent): void {
    if (content.forceCloseOthers) {
      this.forceCloseDialogs();
    }

    const dialogRef = this.matDialogService.open(AuthNotificationDialogComponent, {
      enterAnimationDuration: 150,
      exitAnimationDuration: 150,
      data: content,
    });

    if (content.forceReload) {
      dialogRef
        .afterClosed()
        .pipe(tap((_) => window.location.reload()))
        .subscribe();
    }
  }

  private forceCloseDialogs() {
    this.matDialogService.openDialogs.forEach((dialog) => {
      dialog.close();
    });
  }
}
