import {ComponentFixture, TestBed} from '@angular/core/testing';
import {signal, twoWayBinding} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MatDivider} from '@angular/material/divider';
import {SliderEditComponent} from '../slider-edit/slider-edit.component';
import {ColorPickerEditComponent} from '../color-picker-edit/color-picker-edit.component';
import {Gb3PolygonStyle} from '../../../../../shared/interfaces/internal-drawing-representation.interface';
import {PolygonEditComponent} from './polygon-edit.component';

describe('PolygonEditComponent', () => {
  let component: PolygonEditComponent;
  let fixture: ComponentFixture<PolygonEditComponent>;
  let compiled: HTMLElement;

  const polygonStyle = signal<Gb3PolygonStyle>({
    type: 'polygon',
    strokeWidth: 2,
    strokeOpacity: 0.8,
    strokeColor: '#123456',
    fillOpacity: 0.6,
    fillColor: '#abcdef',
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolygonEditComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(PolygonEditComponent, {
      bindings: [twoWayBinding('polygonStyle', polygonStyle)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the expected sections', () => {
    const headings = Array.from(compiled.querySelectorAll('h3')).map((heading) => heading.textContent?.trim());

    expect(headings).toEqual(['Umrandung', 'Füllung']);
  });

  it('should render three border controls', () => {
    const sliders = fixture.debugElement.queryAll(By.directive(SliderEditComponent));
    const colorPickers = fixture.debugElement.queryAll(By.directive(ColorPickerEditComponent));

    expect(sliders).toHaveLength(3);
    expect(colorPickers).toHaveLength(2);
  });

  it('should render one divider between the sections', () => {
    expect(fixture.debugElement.queryAll(By.directive(MatDivider))).toHaveLength(1);
  });

  it('should initialize the form model from the polygon style', () => {
    expect(component.polygonStyleFormModel()).toEqual({
      type: 'polygon',
      strokeWidth: 2,
      strokeOpacity: 0.8,
      strokeColor: '#123456',
      fillOpacity: 0.6,
      fillColor: '#abcdef',
    });
  });

  it('should update the form model when the polygon style changes', () => {
    polygonStyle.set({
      type: 'polygon',
      strokeWidth: 4,
      strokeOpacity: 0.5,
      strokeColor: '#112233',
      fillOpacity: 0.7,
      fillColor: '#445566',
    });

    fixture.detectChanges();

    expect(component.polygonStyleFormModel()).toEqual({
      type: 'polygon',
      strokeWidth: 4,
      strokeOpacity: 0.5,
      strokeColor: '#112233',
      fillOpacity: 0.7,
      fillColor: '#445566',
    });
  });

  it('should update the polygon style when the form model changes', async () => {
    polygonStyle.set({
      type: 'polygon',
      strokeWidth: 5,
      strokeOpacity: 0.4,
      strokeColor: '#101010',
      fillOpacity: 0.3,
      fillColor: '#202020',
    });

    fixture.detectChanges();
    await fixture.whenStable();

    expect(polygonStyle()).toEqual({
      type: 'polygon',
      strokeWidth: 5,
      strokeOpacity: 0.4,
      strokeColor: '#101010',
      fillOpacity: 0.3,
      fillColor: '#202020',
    });
  });

  it('should pass the correct form fields and configuration to the slider editors', () => {
    const sliders = fixture.debugElement.queryAll(By.directive(SliderEditComponent));

    expect(sliders).toHaveLength(3);

    expect(sliders[0].componentInstance.minValue()).toBe(1);
    expect(sliders[0].componentInstance.maxValue()).toBe(12);
    expect(sliders[0].componentInstance.step()).toBe(1);
    expect(sliders[0].componentInstance.title()).toBe('Strichstärke');

    expect(sliders[1].componentInstance.minValue()).toBe(0);
    expect(sliders[1].componentInstance.maxValue()).toBe(1);
    expect(sliders[1].componentInstance.step()).toBe(0.01);
    expect(sliders[1].componentInstance.title()).toBe('Deckkraft');

    expect(sliders[2].componentInstance.minValue()).toBe(0);
    expect(sliders[2].componentInstance.maxValue()).toBe(1);
    expect(sliders[2].componentInstance.step()).toBe(0.01);
    expect(sliders[2].componentInstance.title()).toBe('Deckkraft');
  });

  it('should pass the correct titles to the color picker editors', () => {
    const colorPickers = fixture.debugElement.queryAll(By.directive(ColorPickerEditComponent));

    expect(colorPickers).toHaveLength(2);
    expect(colorPickers[0].componentInstance.title()).toBe('Strichfarbe');
    expect(colorPickers[1].componentInstance.title()).toBe('Füllfarbe');
  });

  it('should update the bound polygon style when the form changes through a child control', async () => {
    const slider = fixture.debugElement.query(By.directive(SliderEditComponent));
    const sliderValue = slider.componentInstance.value;

    sliderValue.set(7);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(polygonStyle().strokeWidth).toBe(7);
  });
});
