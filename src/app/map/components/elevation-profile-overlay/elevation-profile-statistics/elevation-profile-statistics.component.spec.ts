import {ComponentFixture, TestBed} from '@angular/core/testing';
import {inputBinding, signal} from '@angular/core';
import {ElevationProfileStatistics} from '../../../../shared/interfaces/elevation-profile.interface';
import {ElevationProfileStatisticsComponent} from './elevation-profile-statistics.component';

describe('ElevationProfileStatisticsComponent', () => {
  let component: ElevationProfileStatisticsComponent;
  let fixture: ComponentFixture<ElevationProfileStatisticsComponent>;
  let compiled: HTMLElement;

  const statistics = signal<ElevationProfileStatistics>({
    highestPoint: 1234.56,
    lowestPoint: 456.78,
    linearDistance: 12345.67,
    groundDistance: 13579.24,
    elevationDifference: 777.78,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElevationProfileStatisticsComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(ElevationProfileStatisticsComponent, {
      bindings: [inputBinding('statistics', statistics)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all statistics', () => {
    const items = compiled.querySelectorAll('.elevation-profile-statistics__item');

    expect(items).toHaveLength(5);

    expect(items[0].textContent).toContain('Höchster Punkt:');
    expect(items[1].textContent).toContain('Tiefster Punkt:');
    expect(items[2].textContent).toContain('Luftlinie:');
    expect(items[3].textContent).toContain('Wegstrecke:');
    expect(items[4].textContent).toContain('Höhendifferenz Start - Ende:');
  });

  it('should render the highest point with one decimal place', () => {
    const value = compiled.querySelectorAll('.elevation-profile-statistics__item')[0];

    expect(value.textContent?.trim()).toContain('1’234.6m');
  });

  it('should render the lowest point with one decimal place', () => {
    const value = compiled.querySelectorAll('.elevation-profile-statistics__item')[1];

    expect(value.textContent?.trim()).toContain('456.8m');
  });

  it('should render the linear distance with one decimal place', () => {
    const value = compiled.querySelectorAll('.elevation-profile-statistics__item')[2];

    expect(value.textContent?.trim()).toContain('12’345.7m');
  });

  it('should render the ground distance with one decimal place', () => {
    const value = compiled.querySelectorAll('.elevation-profile-statistics__item')[3];

    expect(value.textContent?.trim()).toContain('13’579.2m');
  });

  it('should render the elevation difference with one decimal place', () => {
    const value = compiled.querySelectorAll('.elevation-profile-statistics__item')[4];

    expect(value.textContent?.trim()).toContain('777.8m');
  });

  it('should update all rendered values when the statistics input changes', () => {
    statistics.set({
      highestPoint: 2000,
      lowestPoint: 100,
      linearDistance: 5000,
      groundDistance: 6000,
      elevationDifference: 1900,
    });
    fixture.detectChanges();

    const items = compiled.querySelectorAll('.elevation-profile-statistics__item');

    expect(items[0].textContent).toContain('2’000.0m');
    expect(items[1].textContent).toContain('100.0m');
    expect(items[2].textContent).toContain('5’000.0m');
    expect(items[3].textContent).toContain('6’000.0m');
    expect(items[4].textContent).toContain('1’900.0m');
  });

  it('should round values to one decimal place', () => {
    statistics.set({
      highestPoint: 1234.55,
      lowestPoint: 456.74,
      linearDistance: 12345.64,
      groundDistance: 13579.25,
      elevationDifference: 777.76,
    });
    fixture.detectChanges();

    const values = compiled.querySelectorAll('.elevation-profile-statistics__item');

    expect(values[0].textContent?.trim()).toContain('1’234.6m');
    expect(values[1].textContent?.trim()).toContain('456.7m');
    expect(values[2].textContent?.trim()).toContain('12’345.6m');
    expect(values[3].textContent?.trim()).toContain('13’579.3m');
    expect(values[4].textContent?.trim()).toContain('777.8m');
  });
});
