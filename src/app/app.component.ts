import {Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DocumentService} from './shared/services/document.service';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {filter, fromEvent, Subscription, tap} from 'rxjs';
import {PageNotificationService} from './shared/services/page-notification.service';
import {MatSnackBar, MatSnackBarRef} from '@angular/material/snack-bar';
import {PageNotificationComponent} from './shared/components/page-notification/page-notification.component';
import {PageNotification} from './shared/interfaces/page-notification.interface';
import {PanelClass} from './shared/enums/panel-class.enum';
import {NavigationEnd, Router} from '@angular/router';
import {map} from 'rxjs/operators';
import {MainPage} from './shared/enums/main-page.enum';
import {UrlUtils} from './shared/utils/url.utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('content') private readonly contentContainer?: ElementRef;

  public contentWidth?: string;
  public showWarning: boolean = false;
  /**
   * Flag which can be used to toggle simplified layouts, e.g. no ZH Lion in the header.
   */
  public isSimplifiedPage: boolean = false;
  private readonly useSimplifiedPageOn: MainPage[] = [MainPage.Maps];
  private readonly subscriptions: Subscription = new Subscription();
  private snackBarRef?: MatSnackBarRef<PageNotificationComponent>;

  constructor(
    private readonly documentService: DocumentService,
    private readonly router: Router,
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

  /**
   * Sets the app content width excluding the scrollbar width if there is any.
   */
  public setAppContentWidth() {
    const contentWidth: number | undefined = this.contentContainer?.nativeElement.offsetWidth;
    this.contentWidth = contentWidth !== undefined ? `${contentWidth}px` : contentWidth;
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
      this.router.events
        .pipe(
          filter((evt) => evt instanceof NavigationEnd),
          map((evt) => evt as NavigationEnd),
          tap((evt) => {
            const firstUrlSegmentPath = UrlUtils.extractFirstUrlSegmentPath(evt.url, this.router);
            const mainPage = UrlUtils.transformStringToMainPage(firstUrlSegmentPath);
            this.isSimplifiedPage = mainPage !== undefined && this.useSimplifiedPageOn.includes(mainPage);
          })
        )
        .subscribe()
    );

    this.subscriptions.add(
      this.pageNotificationService.currentPageNotifications$
        .pipe(
          tap((pageNotifications) => {
            if (pageNotifications.length > 0) {
              // there should be only one page notification active at the same time by definition
              // if there are more than one (as that's technically possible) we only the first one and ignore the rest for now
              this.openPageNotificationSnackBar(pageNotifications[0]);
            } else {
              this.closePageNotificationSnackBar();
            }
          })
        )
        .subscribe()
    );

    this.subscriptions.add(
      fromEvent(window, 'resize')
        .pipe(tap(() => this.setAppContentWidth()))
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
