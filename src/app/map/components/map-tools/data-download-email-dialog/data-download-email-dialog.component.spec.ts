import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {DataDownloadOrderActions} from '../../../../state/map/actions/data-download-order.actions';
import {DataDownloadEmailDialogComponent} from './data-download-email-dialog.component';

describe('DataDownloadEmailDialogComponent', () => {
  const dialogRef = {close: vi.fn()};
  let fixture: ComponentFixture<DataDownloadEmailDialogComponent>;
  let store: MockStore;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [DataDownloadEmailDialogComponent],
      providers: [
        provideMockStore(),
        {provide: MatDialogRef, useValue: dialogRef},
        {provide: MAT_DIALOG_DATA, useValue: {orderEmail: 'orders@example.com'}},
      ],
    })
      .overrideComponent(DataDownloadEmailDialogComponent, {set: {template: '', imports: []}})
      .compileComponents();
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(DataDownloadEmailDialogComponent);
  });

  it('prefills the order email and submits the order', () => {
    const dispatch = vi.spyOn(store, 'dispatch');
    expect(fixture.componentInstance.emailModel().email).toBe('orders@example.com');
    fixture.componentInstance.download();
    expect(dispatch).toHaveBeenCalledWith(DataDownloadOrderActions.setEmailInOrder({email: 'orders@example.com'}));
    expect(dispatch).toHaveBeenCalledWith(DataDownloadOrderActions.sendOrder());
    expect(dialogRef.close).toHaveBeenCalledOnce();
  });

  it('closes without dispatching an order when cancelled', () => {
    fixture.componentInstance.cancel();
    expect(dialogRef.close).toHaveBeenCalledOnce();
  });
});
