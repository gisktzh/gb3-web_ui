import {TestBed} from '@angular/core/testing';
import {MatDialogRef} from '@angular/material/dialog';
import {DataDownloadEmailConfirmationDialogComponent} from './data-download-email-confirmation-dialog.component';

describe('DataDownloadEmailConfirmationDialogComponent', () => {
  it('closes the confirmation dialog', async () => {
    const dialogRef = {close: vi.fn()};
    await TestBed.configureTestingModule({
      imports: [DataDownloadEmailConfirmationDialogComponent],
      providers: [{provide: MatDialogRef, useValue: dialogRef}],
    })
      .overrideComponent(DataDownloadEmailConfirmationDialogComponent, {set: {template: '', imports: []}})
      .compileComponents();
    const fixture = TestBed.createComponent(DataDownloadEmailConfirmationDialogComponent);
    fixture.componentInstance.close();
    expect(dialogRef.close).toHaveBeenCalledOnce();
  });
});
