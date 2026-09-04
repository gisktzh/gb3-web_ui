import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MeasurementToolsComponent} from './measurement-tools.component';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectActiveTool} from '../../../../state/map/reducers/tool.reducer';
import {ToolActions} from '../../../../state/map/actions/tool.actions';

describe('MeasurementToolsComponent', () => {
  let component: MeasurementToolsComponent;
  let fixture: ComponentFixture<MeasurementToolsComponent>;
  let compiled: HTMLElement;
  let store: MockStore;
  let dispatchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeasurementToolsComponent],
      providers: [provideMockStore()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectActiveTool, undefined);

    fixture = TestBed.createComponent(MeasurementToolsComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    dispatchSpy = vi.spyOn(store, 'dispatch');

    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all measurement tool buttons', () => {
    expect(compiled.querySelectorAll('.measurement-tools__button')).toHaveLength(5);
  });

  it('should render the correct aria labels', () => {
    const buttons = compiled.querySelectorAll<HTMLButtonElement>('.measurement-tools__button');

    expect(buttons[0].getAttribute('aria-label')).toBe('Punkt: In Karte klicken um zu wählen.');
    expect(buttons[1].getAttribute('aria-label')).toBe('Strecke: Mit Doppelklick beenden.');
    expect(buttons[2].getAttribute('aria-label')).toBe('Fläche: Auf Startpunkt klicken oder Doppelklick um zu beenden.');
    expect(buttons[3].getAttribute('aria-label')).toBe('Kreis: Mittelpunkt und Radius wählen.');
    expect(buttons[4].getAttribute('aria-label')).toBe('Höhenprofil: Mit Doppelklick beenden, um das Profil zu laden.');
  });

  it('should expose the expected tooltip texts', () => {
    expect(component.tooltipText).toEqual({
      pointMeasurement: 'Punkt: In Karte klicken um zu wählen.',
      lineMeasurement: 'Strecke: Mit Doppelklick beenden.',
      areaMeasurement: 'Fläche: Auf Startpunkt klicken oder Doppelklick um zu beenden.',
      circleMeasurement: 'Kreis: Mittelpunkt und Radius wählen.',
      elevationProfileMeasurement: 'Höhenprofil: Mit Doppelklick beenden, um das Profil zu laden.',
    });
  });

  it('should activate point measurement when it is not active', () => {
    component.togglePointMeasurement();

    expect(dispatchSpy).toHaveBeenCalledWith(ToolActions.activateTool({tool: 'measure-point'}));
  });

  it('should deactivate point measurement when it is active', () => {
    store.overrideSelector(selectActiveTool, 'measure-point');
    store.refreshState();

    component.togglePointMeasurement();

    expect(dispatchSpy).toHaveBeenCalledWith(ToolActions.deactivateTool());
  });

  it('should activate line measurement when it is not active', () => {
    component.toggleLineMeasurement();

    expect(dispatchSpy).toHaveBeenCalledWith(ToolActions.activateTool({tool: 'measure-line'}));
  });

  it('should deactivate line measurement when it is active', () => {
    store.overrideSelector(selectActiveTool, 'measure-line');
    store.refreshState();

    component.toggleLineMeasurement();

    expect(dispatchSpy).toHaveBeenCalledWith(ToolActions.deactivateTool());
  });

  it('should activate area measurement when it is not active', () => {
    component.toggleAreaMeasurement();

    expect(dispatchSpy).toHaveBeenCalledWith(ToolActions.activateTool({tool: 'measure-area'}));
  });

  it('should deactivate area measurement when it is active', () => {
    store.overrideSelector(selectActiveTool, 'measure-area');
    store.refreshState();

    component.toggleAreaMeasurement();

    expect(dispatchSpy).toHaveBeenCalledWith(ToolActions.deactivateTool());
  });

  it('should activate circle measurement when it is not active', () => {
    component.toggleCircleMeasurement();

    expect(dispatchSpy).toHaveBeenCalledWith(ToolActions.activateTool({tool: 'measure-circle'}));
  });

  it('should deactivate circle measurement when it is active', () => {
    store.overrideSelector(selectActiveTool, 'measure-circle');
    store.refreshState();

    component.toggleCircleMeasurement();

    expect(dispatchSpy).toHaveBeenCalledWith(ToolActions.deactivateTool());
  });

  it('should activate elevation profile measurement when it is not active', () => {
    component.toggleElevationProfileMeasurement();

    expect(dispatchSpy).toHaveBeenCalledWith(ToolActions.activateTool({tool: 'measure-elevation-profile'}));
  });

  it('should deactivate elevation profile measurement when it is active', () => {
    store.overrideSelector(selectActiveTool, 'measure-elevation-profile');
    store.refreshState();

    component.toggleElevationProfileMeasurement();

    expect(dispatchSpy).toHaveBeenCalledWith(ToolActions.deactivateTool());
  });

  it('should activate the corresponding tool when each button is clicked', () => {
    const buttons = compiled.querySelectorAll<HTMLButtonElement>('.measurement-tools__button');

    buttons[0].click();
    expect(dispatchSpy).toHaveBeenCalledWith(ToolActions.activateTool({tool: 'measure-point'}));

    dispatchSpy.mockClear();
    buttons[1].click();
    expect(dispatchSpy).toHaveBeenCalledWith(ToolActions.activateTool({tool: 'measure-line'}));

    dispatchSpy.mockClear();
    buttons[2].click();
    expect(dispatchSpy).toHaveBeenCalledWith(ToolActions.activateTool({tool: 'measure-area'}));

    dispatchSpy.mockClear();
    buttons[3].click();
    expect(dispatchSpy).toHaveBeenCalledWith(ToolActions.activateTool({tool: 'measure-circle'}));

    dispatchSpy.mockClear();
    buttons[4].click();
    expect(dispatchSpy).toHaveBeenCalledWith(ToolActions.activateTool({tool: 'measure-elevation-profile'}));
  });

  it('should mark only the active point measurement button as active', () => {
    store.overrideSelector(selectActiveTool, 'measure-point');
    store.refreshState();
    fixture.detectChanges();

    const buttons = compiled.querySelectorAll('.measurement-tools__button');

    expect(buttons[0].classList).toContain('measurement-tools__button--active');
    expect(buttons[1].classList).not.toContain('measurement-tools__button--active');
    expect(buttons[2].classList).not.toContain('measurement-tools__button--active');
    expect(buttons[3].classList).not.toContain('measurement-tools__button--active');
    expect(buttons[4].classList).not.toContain('measurement-tools__button--active');
  });

  it('should mark only the active line measurement button as active', () => {
    store.overrideSelector(selectActiveTool, 'measure-line');
    store.refreshState();
    fixture.detectChanges();

    const buttons = compiled.querySelectorAll('.measurement-tools__button');

    expect(buttons[0].classList).not.toContain('measurement-tools__button--active');
    expect(buttons[1].classList).toContain('measurement-tools__button--active');
    expect(buttons[2].classList).not.toContain('measurement-tools__button--active');
    expect(buttons[3].classList).not.toContain('measurement-tools__button--active');
    expect(buttons[4].classList).not.toContain('measurement-tools__button--active');
  });

  it('should mark only the active area measurement button as active', () => {
    store.overrideSelector(selectActiveTool, 'measure-area');
    store.refreshState();
    fixture.detectChanges();

    const buttons = compiled.querySelectorAll('.measurement-tools__button');

    expect(buttons[0].classList).not.toContain('measurement-tools__button--active');
    expect(buttons[1].classList).not.toContain('measurement-tools__button--active');
    expect(buttons[2].classList).toContain('measurement-tools__button--active');
    expect(buttons[3].classList).not.toContain('measurement-tools__button--active');
    expect(buttons[4].classList).not.toContain('measurement-tools__button--active');
  });

  it('should mark only the active circle measurement button as active', () => {
    store.overrideSelector(selectActiveTool, 'measure-circle');
    store.refreshState();
    fixture.detectChanges();

    const buttons = compiled.querySelectorAll('.measurement-tools__button');

    expect(buttons[0].classList).not.toContain('measurement-tools__button--active');
    expect(buttons[1].classList).not.toContain('measurement-tools__button--active');
    expect(buttons[2].classList).not.toContain('measurement-tools__button--active');
    expect(buttons[3].classList).toContain('measurement-tools__button--active');
    expect(buttons[4].classList).not.toContain('measurement-tools__button--active');
  });

  it('should mark only the active elevation profile measurement button as active', () => {
    store.overrideSelector(selectActiveTool, 'measure-elevation-profile');
    store.refreshState();
    fixture.detectChanges();

    const buttons = compiled.querySelectorAll('.measurement-tools__button');

    expect(buttons[0].classList).not.toContain('measurement-tools__button--active');
    expect(buttons[1].classList).not.toContain('measurement-tools__button--active');
    expect(buttons[2].classList).not.toContain('measurement-tools__button--active');
    expect(buttons[3].classList).not.toContain('measurement-tools__button--active');
    expect(buttons[4].classList).toContain('measurement-tools__button--active');
  });

  it('should not mark any button as active when no tool is active', () => {
    const buttons = compiled.querySelectorAll('.measurement-tools__button');

    buttons.forEach((button) => {
      expect(button.classList).not.toContain('measurement-tools__button--active');
    });
  });
});
