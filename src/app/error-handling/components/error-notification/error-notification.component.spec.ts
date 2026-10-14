import {TestBed} from '@angular/core/testing';
import {MAT_SNACK_BAR_DATA, MatSnackBarRef} from '@angular/material/snack-bar';
import {of} from 'rxjs';
import {ErrorNotificationComponent} from './error-notification.component';

describe('ErrorNotificationComponent', () => {
  it('shows the error, counts down, and can dismiss the notification', async () => {
    vi.useFakeTimers();
    const snackBarRef = {afterOpened: () => of(undefined), dismiss: vi.fn()};
    await TestBed.configureTestingModule({
      imports: [ErrorNotificationComponent],
      providers: [
        {provide: MatSnackBarRef, useValue: snackBarRef},
        {provide: MAT_SNACK_BAR_DATA, useValue: {error: 'Request failed', duration: 1000}},
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ErrorNotificationComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Request failed');

    await vi.advanceTimersByTimeAsync(100);
    expect(fixture.componentInstance.progressbarValue$.value).toBe(90);
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button')?.click();
    expect(snackBarRef.dismiss).toHaveBeenCalledOnce();
    fixture.destroy();
    vi.useRealTimers();
  });
});
