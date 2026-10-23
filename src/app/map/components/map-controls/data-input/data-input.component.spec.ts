import {ComponentFixture, TestBed} from '@angular/core/testing';
import {inputBinding, signal} from '@angular/core';
import {DataInputComponent} from './data-input.component';

describe('DataInputComponent', () => {
  let component: DataInputComponent;
  let fixture: ComponentFixture<DataInputComponent>;
  let compiled: HTMLElement;

  const prefix = signal('');

  beforeEach(async () => {
    prefix.set('');

    await TestBed.configureTestingModule({
      imports: [DataInputComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(DataInputComponent, {
      bindings: [inputBinding('prefix', prefix)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render the prefix when it is empty', () => {
    expect(compiled.querySelector('.data-input__prefix')).toBeNull();
  });

  it('should render the prefix', () => {
    prefix.set('Prefix');
    fixture.detectChanges();

    const prefixElement = compiled.querySelector('.data-input__prefix');

    expect(prefixElement?.textContent).toBe('Prefix');
  });

  it('should update the prefix when the input changes', () => {
    prefix.set('First');
    fixture.detectChanges();

    expect(compiled.querySelector('.data-input__prefix')?.textContent).toBe('First');

    prefix.set('Second');
    fixture.detectChanges();

    expect(compiled.querySelector('.data-input__prefix')?.textContent).toBe('Second');
  });
});
