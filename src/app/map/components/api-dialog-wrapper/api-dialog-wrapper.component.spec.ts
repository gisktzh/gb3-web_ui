import {signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {inputBinding} from '@angular/core';
import {ApiDialogWrapperComponent} from './api-dialog-wrapper.component';

describe('ApiDialogWrapperComponent', () => {
  let fixture: ComponentFixture<ApiDialogWrapperComponent>;
  const title = signal('Save map');
  const savingState = signal<'error' | undefined>(undefined);

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [ApiDialogWrapperComponent]}).compileComponents();
    fixture = TestBed.createComponent(ApiDialogWrapperComponent, {
      bindings: [inputBinding('title', title), inputBinding('savingState', savingState)],
    });
    fixture.detectChanges();
  });

  it('renders the title and emits when the close button is used', () => {
    const closeSpy = vi.spyOn(fixture.componentInstance.closeEvent, 'emit');
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h1')?.textContent).toContain('Save map');
    element.querySelector<HTMLButtonElement>('[aria-label="Schliessen"]')?.click();
    expect(closeSpy).toHaveBeenCalledOnce();
  });

  it('shows the configured error only while saving is in the error state', () => {
    savingState.set('error');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Beim Speichern ist etwas schief gelaufen.');
    savingState.set(undefined);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Beim Speichern ist etwas schief gelaufen.');
  });
});
