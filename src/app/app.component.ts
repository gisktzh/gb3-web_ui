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
  public pageNotification?: PageNotification;
  private snackBarRef?: MatSnackBarRef<PageNotificationComponent>;

  constructor(
    private readonly documentService: DocumentService,
    private readonly breakpointObserver: BreakpointObserver,
    private readonly page: PageNotificationService,
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
            // only show the first page info notification
            this.pageNotification = pageNotifications.length > 0 ? pageNotifications[0] : undefined;
            if (this.pageNotification) {
              this.openSnackBar();
            } else {
              this.closeSnackBar();
            }
          })
        )
        .subscribe()
    );
  }

  public closeSnackBar() {
    this.snackBarRef?.dismiss();
    this.snackBarRef = undefined;
  }

  private openSnackBar() {
    if (!this.pageNotification) {
      this.closeSnackBar();
    }
    this.snackBarRef = this.snackBar.openFromComponent(PageNotificationComponent, {
      data: this.pageNotification,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: PanelClass.PageNotificationSnackbar
    });
  }
}
