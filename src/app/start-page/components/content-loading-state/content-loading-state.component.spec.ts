import {inputBinding, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {LoadingState} from '../../../shared/types/loading-state.type';
import {ContentLoadingStateComponent} from './content-loading-state.component';

describe('ContentLoadingStateComponent', () => {
  it('shows the matching loading and error messages and is silent after success', async () => {
    const state = signal<LoadingState>('loading');
    await TestBed.configureTestingModule({imports: [ContentLoadingStateComponent]}).compileComponents();
    const fixture = TestBed.createComponent(ContentLoadingStateComponent, {
      bindings: [
        inputBinding('loadingState', state),
        inputBinding('loadingText', () => 'Loading maps'),
        inputBinding('loadingCompletedText', () => 'Maps failed'),
      ],
    });
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Loading maps');
    expect(element.querySelector('mat-progress-bar')?.getAttribute('mode')).toBe('query');

    state.set('error');
    fixture.detectChanges();
    expect(element.textContent).toContain('Maps failed');
    expect(element.querySelector('mat-progress-bar')?.getAttribute('mode')).toBe('determinate');

    state.set('loaded');
    fixture.detectChanges();
    expect(element.textContent?.trim()).toBe('');
  });
});
