import {TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {StatisticsToolsComponent} from './statistics-tools.component';
import {ToolActions} from '../../../../state/map/actions/tool.actions';
import {selectActiveTool} from '../../../../state/map/reducers/tool.reducer';

describe('StatisticsToolsComponent', () => {
  let store: MockStore;
  const dispatch = vi.fn();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StatisticsToolsComponent],
      providers: [provideMockStore()],
    });

    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch').mockImplementation(dispatch);
  });

  afterEach(() => {
    store.resetSelectors();
    vi.clearAllMocks();
  });

  it('should activate circle selection', () => {
    store.overrideSelector(selectActiveTool, undefined);

    const component = TestBed.createComponent(StatisticsToolsComponent).componentInstance;

    component.toggleCircleSelecting();

    expect(dispatch).toHaveBeenCalledWith(ToolActions.activateTool({tool: 'select-statistics-circle'}));
  });

  it('should deactivate circle selection if already active', () => {
    store.overrideSelector(selectActiveTool, 'select-statistics-circle');

    const component = TestBed.createComponent(StatisticsToolsComponent).componentInstance;

    component.toggleCircleSelecting();

    expect(dispatch).toHaveBeenCalledWith(ToolActions.deactivateTool());
  });

  it('should activate polygon selection', () => {
    store.overrideSelector(selectActiveTool, undefined);

    const component = TestBed.createComponent(StatisticsToolsComponent).componentInstance;

    component.togglePolygonSelecting();

    expect(dispatch).toHaveBeenCalledWith(ToolActions.activateTool({tool: 'select-statistics-polygon'}));
  });

  it('should deactivate polygon selection if already active', () => {
    store.overrideSelector(selectActiveTool, 'select-statistics-polygon');

    const component = TestBed.createComponent(StatisticsToolsComponent).componentInstance;

    component.togglePolygonSelecting();

    expect(dispatch).toHaveBeenCalledWith(ToolActions.deactivateTool());
  });
});
