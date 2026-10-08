import {Component, input} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {FeatureFlagsService} from '../../../../shared/services/feature-flags.service';
import {QueryModeActions} from '../../../../state/map/actions/query-mode.actions';
import {selectQueryMode} from '../../../../state/map/reducers/query-mode.reducer';
import {FeatureInfoComponent} from '../feature-info/feature-info.component';
import {StatisticsComponent} from '../statistics/statistics.component';
import {QueryResultsComponent} from './query-results.component';

@Component({selector: 'feature-info', template: 'Feature results'})
class FeatureResultsStub {
  public readonly showInteractiveElements = input(true);
}

@Component({selector: 'statistics', template: 'Statistics results'})
class StatisticsResultsStub {
  public readonly showInteractiveElements = input(true);
}

describe('QueryResultsComponent', () => {
  let fixture: ComponentFixture<QueryResultsComponent>;
  let store: MockStore;
  let statisticsEnabled: boolean;

  beforeEach(async () => {
    statisticsEnabled = true;
    await TestBed.configureTestingModule({
      imports: [QueryResultsComponent],
      providers: [provideMockStore(), {provide: FeatureFlagsService, useValue: {getFeatureFlag: () => statisticsEnabled}}],
    })
      .overrideComponent(QueryResultsComponent, {
        remove: {imports: [FeatureInfoComponent, StatisticsComponent]},
        add: {imports: [FeatureResultsStub, StatisticsResultsStub]},
      })
      .compileComponents();
    store = TestBed.inject(MockStore);
    store.overrideSelector(selectQueryMode, 'feature');
  });

  async function render() {
    fixture = TestBed.createComponent(QueryResultsComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('associates tabs with their panel and emits explicit selection even for the active tab', async () => {
    await render();
    const dispatch = vi.spyOn(store, 'dispatch');
    const tabs: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]'));
    const panel: HTMLElement = fixture.nativeElement.querySelector('[role="tabpanel"]');
    expect(tabs).toHaveLength(2);
    expect(tabs[0].getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.getAttribute('aria-labelledby')).toBe(tabs[0].id);
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, -1]);
    tabs[0].click();
    expect(dispatch).toHaveBeenLastCalledWith(QueryModeActions.selectQueryMode({queryMode: 'feature'}));
    tabs[1].click();
    expect(dispatch).toHaveBeenLastCalledWith(QueryModeActions.selectQueryMode({queryMode: 'statistics'}));
  });

  it('switches displayed content according to the shared mode', async () => {
    await render();
    expect(fixture.nativeElement.textContent).toContain('Feature results');
    store.overrideSelector(selectQueryMode, 'statistics');
    store.refreshState();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Statistics results');
    expect(fixture.nativeElement.querySelector('feature-info')).toBeNull();
  });

  it('keeps feature-only content when statistics is disabled', async () => {
    statisticsEnabled = false;
    await render();
    expect(fixture.nativeElement.querySelector('[role="tablist"]')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Feature results');
  });

  it('disables mode changes in read-only views', async () => {
    await render();
    fixture.componentRef.setInput('showInteractiveElements', false);
    fixture.detectChanges();
    const dispatch = vi.spyOn(store, 'dispatch');
    const tabs: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]'));
    expect(tabs.every((tab) => tab.getAttribute('aria-disabled') === 'true')).toBe(true);
    tabs[1].click();
    expect(dispatch).not.toHaveBeenCalled();
  });
});
