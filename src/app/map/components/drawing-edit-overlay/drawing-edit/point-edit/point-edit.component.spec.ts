import {signal, twoWayBinding} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Gb3PointStyle} from '../../../../../shared/interfaces/internal-drawing-representation.interface';
import {ColorPickerEditComponent} from '../color-picker-edit/color-picker-edit.component';
import {SliderEditComponent} from '../slider-edit/slider-edit.component';
import {PointEditComponent} from './point-edit.component';

describe('PointEditComponent', () => {
  let fixture: ComponentFixture<PointEditComponent>;
  const style = signal<Gb3PointStyle>({
    type: 'point',
    strokeWidth: 2,
    strokeOpacity: 0.8,
    strokeColor: '#123456',
    fillOpacity: 0.5,
    fillColor: '#abcdef',
    pointRadius: 10,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [PointEditComponent]}).compileComponents();
    fixture = TestBed.createComponent(PointEditComponent, {bindings: [twoWayBinding('pointStyle', style)]});
    fixture.detectChanges();
  });

  it('renders controls for stroke, fill, and radius', () => {
    const headings = [...fixture.nativeElement.querySelectorAll('h3')].map((heading: HTMLElement) => heading.textContent?.trim());

    expect(headings).toEqual(['Umrandung', 'Füllung', 'Grösse']);
    expect(fixture.debugElement.queryAll(By.directive(SliderEditComponent))).toHaveLength(4);
    expect(fixture.debugElement.queryAll(By.directive(ColorPickerEditComponent))).toHaveLength(2);
  });

  it('keeps the external style and form model in sync', () => {
    fixture.componentInstance.pointStyleFormModel.set({...style(), pointRadius: 24});
    fixture.detectChanges();

    expect(style().pointRadius).toBe(24);

    style.set({...style(), fillColor: '#00ff00'});
    fixture.detectChanges();

    expect(fixture.componentInstance.pointStyleFormModel().fillColor).toBe('#00ff00');
  });
});
