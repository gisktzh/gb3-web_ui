import {Component, OnInit, Input, Output, EventEmitter, OnDestroy} from '@angular/core';
import {Subscription, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {selectBottomSheetHeight} from 'src/app/state/map/reducers/map-ui.reducer';
import {BottomSheetHeight} from 'src/app/shared/enums/bottom-sheet-heights.enum';

@Component({
  selector: 'bottom-sheet-item',
  templateUrl: './bottom-sheet-item.component.html',
  styleUrls: ['./bottom-sheet-item.component.scss'],
})
export class BottomSheetItemComponent implements OnInit, OnDestroy {
  constructor(private readonly store: Store) {}

  @Input() public overlayTitle: string = '';
  @Input() public isVisible: boolean = false;
  @Input() public isBlue: boolean = false;
  @Output() public readonly closeEvent = new EventEmitter<void>();

  private readonly subscriptions = new Subscription();

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public onClose() {
    this.closeEvent.emit();
  }

  public initSubscriptions() {}
}
