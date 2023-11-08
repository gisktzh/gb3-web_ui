import {Component} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {PanelClass} from '../../enums/panel-class.enum';
import {NavbarMobileDialogComponent} from './navbar-mobile-dialog/navbar-mobile-dialog.component';

@Component({
  selector: 'navbar-mobile',
  templateUrl: './navbar-mobile.component.html',
  styleUrls: ['./navbar-mobile.component.scss'],
})
export class NavbarMobileComponent {
  constructor(public dialog: MatDialog) {}

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
