import {TestBed} from '@angular/core/testing';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AuthNotificationDialogComponent} from './auth-notification-dialog.component';

describe('AuthNotificationDialogComponent', () => {
  it('renders the supplied authentication message', async () => {
    await TestBed.configureTestingModule({
      imports: [AuthNotificationDialogComponent],
      providers: [
        {provide: MAT_DIALOG_DATA, useValue: {title: 'Session expired', text: 'Please sign in again'}},
        {provide: MatDialogRef, useValue: {close: vi.fn()}},
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(AuthNotificationDialogComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain('Session expired');
    expect(element.textContent).toContain('Please sign in again');
    expect(element.querySelector('button')?.textContent).toContain('Schliessen');
  });
});
