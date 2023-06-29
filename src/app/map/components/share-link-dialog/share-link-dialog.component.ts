import {Component, OnDestroy, OnInit} from '@angular/core';
import {HasSavingState} from '../../../shared/interfaces/has-saving-state.interface';
import {LoadingState} from '../../../shared/types/loading-state';
import {Subscription} from 'rxjs';
import {MatDialogRef} from '@angular/material/dialog';
import {Store} from '@ngrx/store';

@Component({
  selector: 'share-link-dialog',
  templateUrl: './share-link-dialog.component.html',
  styleUrls: ['./share-link-dialog.component.scss']
})
export class ShareLinkDialogComponent implements OnInit, OnDestroy, HasSavingState {
  public shareLink?: string;
  public iframeCode?: string;
  public savingState: LoadingState = 'undefined';

  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly dialogRef: MatDialogRef<ShareLinkDialogComponent>, private readonly store: Store) {}

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngOnInit() {}

  public abort() {
    this.close(true);
  }

  public close(isAborted: boolean = false) {
    this.dialogRef.close(isAborted);
  }
}
