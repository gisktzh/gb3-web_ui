import {signal, twoWayBinding} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Gb3TextStyle} from '../../../../../shared/interfaces/internal-drawing-representation.interface';
import {TextEditComponent} from './text-edit.component';

const initialStyle: Gb3TextStyle = {
  type: 'text',
  fontSize: '16',
  fontColor: '#000000',
  fontFamily: 'Arial',
  labelYOffset: '4',
  labelAlign: 'center',
  haloColor: '#ffffff',
  haloRadius: '2',
  label: '',
};

describe('TextEditComponent', () => {
  let fixture: ComponentFixture<TextEditComponent>;
  const textStyle = signal({style: initialStyle, label: 'Beschriftung'});

  beforeEach(async () => {
    textStyle.set({style: initialStyle, label: 'Beschriftung'});
    await TestBed.configureTestingModule({imports: [TextEditComponent]}).compileComponents();
    fixture = TestBed.createComponent(TextEditComponent, {bindings: [twoWayBinding('textStyle', textStyle)]});
    fixture.detectChanges();
  });

  it('shows the current label and all style sections', () => {
    const headings = [...fixture.nativeElement.querySelectorAll('h3')].map((heading: HTMLElement) => heading.textContent?.trim());
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(input.value).toBe('Beschriftung');
    expect(headings).toEqual(['Text', 'Schrift', 'Halo', 'Versatz']);
  });

  it('publishes a label entered by the user', async () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'Neue Beschriftung';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 20));
    fixture.detectChanges();

    expect(textStyle().label).toBe('Neue Beschriftung');
  });

  it('reacts when the selected text style is replaced', () => {
    textStyle.set({style: {...initialStyle, fontColor: '#ff0000'}, label: 'Andere Beschriftung'});
    fixture.detectChanges();

    expect(fixture.componentInstance.textStyleFormModel().label).toBe('Andere Beschriftung');
    expect(fixture.componentInstance.textStyleFormModel().style.fontColor).toBe('#ff0000');
  });
});
