import {signal, twoWayBinding} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Gb3PolygonStyle} from '../../../../../shared/interfaces/internal-drawing-representation.interface';
import {ColorPickerEditComponent} from '../color-picker-edit/color-picker-edit.component';
import {SliderEditComponent} from '../slider-edit/slider-edit.component';
import {PolygonEditComponent} from './polygon-edit.component';

describe('PolygonEditComponent', () => {
  let fixture: ComponentFixture<PolygonEditComponent>;
  const style = signal<Gb3PolygonStyle>({
    type: 'polygon',
    strokeWidth: 2,
    strokeOpacity: 0.8,
    strokeColor: '#123456',
    fillOpacity: 0.5,
    fillColor: '#abcdef',
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [PolygonEditComponent]}).compileComponents();
    fixture = TestBed.createComponent(PolygonEditComponent, {bindings: [twoWayBinding('polygonStyle', style)]});
    fixture.detectChanges();
  });

  it('renders controls for the outline and fill', () => {
    const headings = [...fixture.nativeElement.querySelectorAll('h3')].map((heading: HTMLElement) => heading.textContent?.trim());

    expect(headings).toEqual(['Umrandung', 'Füllung']);
    expect(fixture.debugElement.queryAll(By.directive(SliderEditComponent))).toHaveLength(3);
    expect(fixture.debugElement.queryAll(By.directive(ColorPickerEditComponent))).toHaveLength(2);
  });

  it('publishes edits and reacts to replacement styles', () => {
    fixture.componentInstance.polygonStyleFormModel.set({...style(), strokeWidth: 7});
    fixture.detectChanges();
    expect(style().strokeWidth).toBe(7);

    style.set({...style(), fillOpacity: 0.25});
    fixture.detectChanges();
    expect(fixture.componentInstance.polygonStyleFormModel().fillOpacity).toBe(0.25);
  });
});
