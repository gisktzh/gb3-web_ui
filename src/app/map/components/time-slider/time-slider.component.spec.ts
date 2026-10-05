import {TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {DateAdapter} from '@angular/material/core';
import {MatDatepicker} from '@angular/material/datepicker';
import {AuthModule} from '../../../auth/auth.module';
import {TimeSliderComponent} from './time-slider.component';
import {TimeSliderConfiguration} from '../../../shared/interfaces/topic.interface';

describe('TimeSliderComponent datepicker providers', () => {
  it('opens the Swiss-localized calendar without global Material providers', () => {
    TestBed.configureTestingModule({imports: [AuthModule, TimeSliderComponent]});
    expect(TestBed.inject(DateAdapter, null)).toBeNull();

    const fixture = TestBed.createComponent(TimeSliderComponent);
    const config: TimeSliderConfiguration = {
      name: 'Years',
      alwaysMaxRange: false,
      dateFormat: 'YYYY',
      minimumDate: '2000',
      maximumDate: '2005',
      sourceType: 'parameter',
      source: {startRangeParameter: '', endRangeParameter: '', layerIdentifiers: []},
    };
    fixture.componentRef.setInput('timeSliderConfiguration', config);
    fixture.componentRef.setInput('initialTimeExtent', {start: new Date(2000, 0, 1), end: new Date(2005, 0, 1)});
    fixture.detectChanges();

    const adapter = fixture.debugElement.injector.get(DateAdapter);
    expect(adapter.getFirstDayOfWeek()).toBe(1);
    expect(adapter.getMonthNames('long')[0]).toBe('Januar');

    const datepicker = fixture.debugElement.query(By.directive(MatDatepicker)).componentInstance as MatDatepicker<Date>;
    datepicker.open();
    fixture.detectChanges();
    expect(document.querySelector('mat-calendar')).not.toBeNull();
    datepicker.close();
  });
});
