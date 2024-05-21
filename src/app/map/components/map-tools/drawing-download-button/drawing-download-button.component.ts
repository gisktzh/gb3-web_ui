import {Component, OnDestroy, OnInit} from '@angular/core';
import {ExportActions} from '../../../../state/map/actions/export.actions';
import {Store} from '@ngrx/store';
import {MatIcon} from '@angular/material/icon';
import {selectDrawings} from '../../../../state/map/reducers/drawing.reducer';
import {Subscription, tap} from 'rxjs';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIconButton} from '@angular/material/button';

@Component({
  selector: 'drawing-download-button',
  standalone: true,
  imports: [MatIcon, MatTooltip, MatIconButton],
  templateUrl: './drawing-download-button.component.html',
  styleUrl: './drawing-download-button.component.scss',
})
export class DrawingDownloadButtonComponent implements OnInit, OnDestroy {
  public hasDrawings: boolean = false;
  private readonly drawings$ = this.store.select(selectDrawings);
  protected readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public downloadDrawings() {
    this.store.dispatch(ExportActions.requestDrawingsExport({exportFormat: 'geojson'}));
  }

  private initSubscriptions() {
    this.subscriptions.add(this.drawings$.pipe(tap((drawings) => (this.hasDrawings = drawings.length > 0))).subscribe());
  }
}
