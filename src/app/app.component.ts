import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {DocumentService} from './shared/services/document.service';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Subscription, tap} from 'rxjs';
import {PageNotificationService} from './shared/services/page-notification.service';
import {MatSnackBar, MatSnackBarRef} from '@angular/material/snack-bar';
import {PageNotificationComponent} from './shared/components/page-notification/page-notification.component';
import {PageNotification} from './shared/interfaces/page-notification.interface';
import {PanelClass} from './shared/enums/panel-class.enum';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  public showWarning: boolean = false;

  private readonly subscriptions: Subscription = new Subscription();
  private snackBarRef?: MatSnackBarRef<PageNotificationComponent>;

  constructor(
    private readonly documentService: DocumentService,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly snackBar: MatSnackBar,
    private readonly pageNotificationService: PageNotificationService
  ) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  private onDocumentClick(event: PointerEvent) {
    this.documentService.documentClicked$.next(event);
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.breakpointObserver
        .observe([Breakpoints.Small, Breakpoints.XSmall])
        .pipe(
          tap((result) => {
            this.showWarning = result.matches;
          })
        )
        .subscribe()
    );

    this.subscriptions.add(
      this.pageNotificationService.currentPageNotifications$
        .pipe(
          tap((pageNotifications) => {
            if (pageNotifications.length > 0) {
              // only show the first available notification for this page
              this.openPageNotificationSnackBar(pageNotifications[0]);
            } else {
              this.closePageNotificationSnackBar();
            }
          })
        )
        .subscribe()
    );
  }

  private closePageNotificationSnackBar() {
    this.snackBarRef?.dismiss();
    this.snackBarRef = undefined;
  }

  private openPageNotificationSnackBar(pageNotification: PageNotification) {
    this.snackBarRef = this.snackBar.openFromComponent(PageNotificationComponent, {
      data: pageNotification,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: PanelClass.PageNotificationSnackbar
    });
  }
}
