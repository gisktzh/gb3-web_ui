import {Component, OnDestroy, OnInit} from '@angular/core';
import {HasSavingState} from '../../../shared/interfaces/has-saving-state.interface';
import {LoadingState} from '../../../shared/types/loading-state';
import {Subscription, tap} from 'rxjs';
import {MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngrx/store';
import {selectId, selectSavingState} from '../../../state/map/reducers/share-link.reducer';

@Component({
  selector: 'share-link-dialog',
  templateUrl: './share-link-dialog.component.html',
  styleUrls: ['./share-link-dialog.component.scss'],
})
export class ShareLinkDialogComponent implements OnInit, OnDestroy, HasSavingState {
  public shareLink?: string;
  public iframeCode?: string;
  public savingState: LoadingState = 'undefined';

  private readonly subscriptions: Subscription = new Subscription();
  private readonly shareLinkId$ = this.store.select(selectId);
  private readonly savingState$ = this.store.select(selectSavingState);

  constructor(
    private readonly dialogRef: MatDialogRef<ShareLinkDialogComponent>,
    private readonly store: Store,
  ) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public initSubscriptions() {
    this.subscriptions.add(this.savingState$.pipe(tap((savingState) => (this.savingState = savingState))).subscribe());
    this.subscriptions.add(
      this.shareLinkId$
        .pipe(
          tap((shareLinkId) => {
            this.shareLink = shareLinkId; // TODO WES: ID => url
          }),
        )
        .subscribe(),
    );
  }

  public close(isAborted: boolean = false) {
    this.dialogRef.close(isAborted);
  }
}
