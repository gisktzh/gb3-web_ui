import {ComponentFixture, TestBed} from '@angular/core/testing';
import {signal, twoWayBinding} from '@angular/core';
import {By} from '@angular/platform-browser';
import {Gb3TextStyle} from '../../../../../shared/interfaces/internal-drawing-representation.interface';
import {TextEditComponent} from './text-edit.component';

describe('TextEditComponent', () => {
  let component: TextEditComponent;
  let fixture: ComponentFixture<TextEditComponent>;
  let compiled: HTMLElement;

  const textStyle = signal<{
    style: Gb3TextStyle;
    label: string;
  }>({
    style: {
      type: 'text',
      fontSize: '16',
      fontColor: '#000000',
      haloRadius: '2',
      haloColor: '#ffffff',
      labelYOffset: '5',
      label: '',
      fontFamily: '',
      labelAlign: '',
    },
    label: 'Test label',
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextEditComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(TextEditComponent, {
      bindings: [twoWayBinding('textStyle', textStyle)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the label from the text style', () => {
    const input = compiled.querySelector('input');

    expect(input).toBeTruthy();
    expect(input?.value).toBe('Test label');
  });

  it('should render the text section', () => {
    const headings = Array.from(compiled.querySelectorAll('h3')).map((heading) => heading.textContent?.trim());

    expect(headings).toContain('Text');
    expect(headings).toContain('Schrift');
    expect(headings).toContain('Halo');
    expect(headings).toContain('Versatz');
  });

  it('should render the label input', () => {
    const input = compiled.querySelector('input[matInput]');

    expect(input).toBeTruthy();
    expect(input?.getAttribute('maxlength')).toBeTruthy();
  });

  it('should render three slider editors', () => {
    const sliderEdits = fixture.debugElement.queryAll(By.css('slider-edit'));

    expect(sliderEdits).toHaveLength(3);
  });

  it('should render two color picker editors', () => {
    const colorPickerEdits = fixture.debugElement.queryAll(By.css('color-picker-edit'));

    expect(colorPickerEdits).toHaveLength(2);
  });

  it('should render three dividers', () => {
    const dividers = compiled.querySelectorAll('mat-divider');

    expect(dividers).toHaveLength(3);
  });

  it('should update the form when the textStyle input changes', async () => {
    textStyle.set({
      style: {
        type: 'text',
        fontSize: '24',
        fontColor: '#112233',
        haloRadius: '4',
        haloColor: '#445566',
        labelYOffset: '8',
        label: '',
        fontFamily: '',
        labelAlign: '',
      },
      label: 'Updated label',
    });

    fixture.detectChanges();
    await fixture.whenStable();

    const input = compiled.querySelector('input');

    expect(input?.value).toBe('Updated label');
    expect(component.textStyleFormModel()).toEqual({
      label: 'Updated label',
      style: {
        type: 'text',
        fontSize: '24',
        fontColor: '#112233',
        haloRadius: '4',
        haloColor: '#445566',
        labelYOffset: '8',
        labelAlign: '',
        label: '',
        fontFamily: '',
      },
    });
  });

  it('should use an empty label when the input label is empty', async () => {
    textStyle.set({
      style: {
        type: 'text',
        fontSize: '16',
        fontColor: '#000000',
        haloRadius: '2',
        haloColor: '#ffffff',
        labelYOffset: '5',
        label: '',
        fontFamily: '',
        labelAlign: '',
      },
      label: '',
    });

    fixture.detectChanges();
    await fixture.whenStable();

    const input = compiled.querySelector('input');

    expect(input?.value).toBe('');
  });

  it('should preserve the supplied style values in the form model', () => {
    expect(component.textStyleFormModel()).toEqual({
      label: '',
      style: {
        type: 'text',
        fontSize: '16',
        fontColor: '#000000',
        haloRadius: '2',
        haloColor: '#ffffff',
        labelYOffset: '5',
        fontFamily: '',
        label: '',
        labelAlign: '',
      },
    });
  });

  it('should update the text style through the public form when the label is changed', async () => {
    const input = compiled.querySelector('input');

    expect(input).toBeTruthy();

    input!.value = 'Changed label';
    input!.dispatchEvent(new Event('input'));

    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 20));
    await fixture.whenStable();

    expect(textStyle().label).toBe('Changed label');
  });

  it('should apply default style values when they are not provided', async () => {
    const styleWithDefaults: Gb3TextStyle = {
      type: 'text',
      fontSize: '10',
      fontColor: '#ff0000',
      haloRadius: '1',
      haloColor: '#ff0000',
      labelYOffset: '1',
      label: '',
      fontFamily: '',
      labelAlign: '',
    };

    textStyle.set({
      style: styleWithDefaults,
      label: 'Defaults',
    });

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.textStyleFormModel()).toEqual({
      label: 'Defaults',
      style: styleWithDefaults,
    });
  });
});
