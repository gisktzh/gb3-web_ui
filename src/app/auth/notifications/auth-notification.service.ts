import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {AuthNotificationDialogComponent} from './auth-notification-dialog/auth-notification-dialog.component';

export interface DialogContent {
  title: string;
  text: string;
}

const impendingLogoutDialogContent: DialogContent = {
  title: 'Information',
  text: 'Sie werden in Kürze ausgeloggt. Bitte schliessen Sie aktuelle Arbeiten ab oder starten Sie eine neue Sitzung.'
};
const forcedLogoutDialogContent: DialogContent = {
  title: 'Information',
  text: 'Sie wurden ausgeloggt, da Ihr Login das Ende seiner Gültigkeit erreicht hat.'
};

@Injectable({
  providedIn: 'root'
})
export class AuthNotificationService {
  constructor(private readonly matDialogService: MatDialog) {}

  public showImpendingLogoutDialog() {
    this.openDialog(impendingLogoutDialogContent);
  }

  public showForcedLogoutDialog() {
    this.openDialog(forcedLogoutDialogContent);
  }

  private openDialog(content: DialogContent): void {
    this.matDialogService.open(AuthNotificationDialogComponent, {
      enterAnimationDuration: 150,
      exitAnimationDuration: 150,
      data: content
    });
  }
}
