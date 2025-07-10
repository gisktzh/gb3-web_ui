import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {MatIcon} from '@angular/material/icon';
import {selectDrawings} from '../../../../state/map/reducers/drawing.reducer';
import {Subscription, tap} from 'rxjs';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIconButton} from '@angular/material/button';
import {DrawingDownloadDialogComponent} from '../drawing-download-dialog/drawing-download-dialog.component';
import {PanelClass} from '../../../../shared/enums/panel-class.enum';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'drawing-download-button',
  imports: [MatIcon, MatTooltip, MatIconButton],
  templateUrl: './drawing-download-button.component.html',
  styleUrl: './drawing-download-button.component.scss',
})
export class DrawingDownloadButtonComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly dialogService = inject(MatDialog);

  public hasDrawings: boolean = false;
  private readonly drawings$ = this.store.select(selectDrawings);
  protected readonly subscriptions: Subscription = new Subscription();

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public openDownloadDialog() {
    this.dialogService.open(DrawingDownloadDialogComponent, {
      panelClass: PanelClass.ApiWrapperDialog,
      restoreFocus: false,
      autoFocus: false,
    });
  }

  private initSubscriptions() {
    this.subscriptions.add(this.drawings$.pipe(tap((drawings) => (this.hasDrawings = drawings.length > 0))).subscribe());
  }
}
