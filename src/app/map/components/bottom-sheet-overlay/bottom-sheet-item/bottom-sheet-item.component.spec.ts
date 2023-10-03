import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BottomSheetItemComponent} from './bottom-sheet-item.component';

describe('BottomSheetItemComponent', () => {
  let component: BottomSheetItemComponent;
  let fixture: ComponentFixture<BottomSheetItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BottomSheetItemComponent],
    });
    fixture = TestBed.createComponent(BottomSheetItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
