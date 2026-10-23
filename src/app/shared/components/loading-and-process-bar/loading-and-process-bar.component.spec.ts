import {ComponentFixture, TestBed} from '@angular/core/testing';
import {LoadingAndProcessBarComponent} from './loading-and-process-bar.component';
import {inputBinding, signal} from '@angular/core';
import {LoadingState} from '../../types/loading-state.type';
import {ViewProcessState} from '../../types/view-process-state.type';

describe('LoadingAndProcessBarComponent', () => {
  let component: LoadingAndProcessBarComponent;
  let fixture: ComponentFixture<LoadingAndProcessBarComponent>;
  let compiled: HTMLElement;

  const loadingState = signal<LoadingState | undefined>(undefined);
  const viewProcessState = signal<ViewProcessState | undefined>(undefined);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingAndProcessBarComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingAndProcessBarComponent, {
      bindings: [inputBinding('loadingState', loadingState), inputBinding('viewProcessState', viewProcessState)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loading state', () => {
    it('should show query progress bar when loading', () => {
      loadingState.set('loading');
      fixture.detectChanges();

      const progressBar = compiled.querySelector<HTMLElement>('.loading-and-process-bar');

      expect(progressBar).toBeTruthy();
      expect(progressBar?.getAttribute('mode')).toBe('query');
    });

    it('should show error progress bar when loading state is error', () => {
      loadingState.set('error');
      fixture.detectChanges();

      const progressBar = compiled.querySelector<HTMLElement>('.loading-and-process-bar');

      expect(progressBar).toBeTruthy();
      expect(progressBar?.getAttribute('color')).toBe('warn');
      expect(progressBar?.getAttribute('mode')).toBe('determinate');
    });

    it('should not show progress bar for loaded state without view process state', () => {
      loadingState.set('loaded');
      viewProcessState.set(undefined);

      fixture.detectChanges();

      expect(compiled.querySelector('.loading-and-process-bar')).toBeFalsy();
    });
  });

  describe('view process state', () => {
    it('should show buffer progress bar when view process is updating and loading state is undefined', () => {
      loadingState.set(undefined);
      viewProcessState.set('updating');

      fixture.detectChanges();

      const progressBar = compiled.querySelector<HTMLElement>('.loading-and-process-bar');

      expect(progressBar).toBeTruthy();
      expect(progressBar?.getAttribute('mode')).toBe('buffer');
    });

    it('should show buffer progress bar when view process is updating and loading state is loaded', () => {
      loadingState.set('loaded');
      viewProcessState.set('updating');

      fixture.detectChanges();

      const progressBar = compiled.querySelector<HTMLElement>('.loading-and-process-bar');

      expect(progressBar).toBeTruthy();
      expect(progressBar?.getAttribute('mode')).toBe('buffer');
    });

    it('should not show buffer progress bar when view process is not updating', () => {
      loadingState.set('loaded');
      viewProcessState.set(undefined);

      fixture.detectChanges();

      expect(compiled.querySelector('.loading-and-process-bar')).toBeFalsy();
    });
  });

  describe('priority between loading and view process state', () => {
    it('should show loading progress bar instead of view process bar', () => {
      loadingState.set('loading');
      viewProcessState.set('updating');

      fixture.detectChanges();

      const progressBar = compiled.querySelector<HTMLElement>('.loading-and-process-bar');

      expect(progressBar).toBeTruthy();
      expect(progressBar?.getAttribute('mode')).toBe('query');
    });

    it('should show error progress bar instead of view process bar', () => {
      loadingState.set('error');
      viewProcessState.set('updating');

      fixture.detectChanges();

      const progressBar = compiled.querySelector<HTMLElement>('.loading-and-process-bar');

      expect(progressBar).toBeTruthy();
      expect(progressBar?.getAttribute('mode')).toBe('determinate');
    });
  });
});
