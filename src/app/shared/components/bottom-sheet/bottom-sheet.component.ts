import {Component} from '@angular/core';
import {MatListModule} from '@angular/material/list';
import {MatBottomSheetRef} from '@angular/material/bottom-sheet';

@Component({
  selector: 'bottom-sheet',
  templateUrl: './bottom-sheet.component.html',
  styleUrls: ['./bottom-sheet.component.scss'],
  standalone: true,
  imports: [MatListModule],
})
export class BottomSheetComponent {
  constructor(private _bottomSheetRef: MatBottomSheetRef<BottomSheetComponent>) {}
}
