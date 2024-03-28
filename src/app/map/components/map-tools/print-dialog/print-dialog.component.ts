import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {LoadingState} from '../../../../shared/types/loading-state.type';
import {Store} from '@ngrx/store';
import {BehaviorSubject, combineLatestWith, distinctUntilChanged, filter, Subscription, tap, withLatestFrom} from 'rxjs';
import {selectCapabilities, selectCapabilitiesLoadingState, selectCreationLoadingState} from '../../../../state/map/reducers/print.reducer';
import {PrintCapabilities, ReportOrientation} from '../../../../shared/interfaces/print.interface';
import {PrintActions} from '../../../../state/map/actions/print.actions';
import {MapConfigState} from '../../../../state/map/states/map-config.state';
import {selectMapConfigState} from '../../../../state/map/reducers/map-config.reducer';
import {ActiveMapItem} from '../../../models/active-map-item.model';
import {selectItems} from '../../../../state/map/selectors/active-map-items.selector';
import {MapUiActions} from '../../../../state/map/actions/map-ui.actions';
import {map} from 'rxjs/operators';
import {ConfigService} from '../../../../shared/services/config.service';
import {Gb3StyledInternalDrawingRepresentation} from '../../../../shared/interfaces/internal-drawing-representation.interface';
import {selectDrawings} from '../../../../state/map/reducers/drawing.reducer';
import {Gb3PrintService} from '../../../../shared/services/apis/gb3/gb3-print.service';
import {PrintData} from '../../../interfaces/print-data.interface';

interface PrintForm {
  title: FormControl<string | null>;
  comment: FormControl<string | null>;
  reportLayout: FormControl<string | null>;
  reportOrientation: FormControl<ReportOrientation | null>;
  dpi: FormControl<number | null>;
  rotation: FormControl<number | null>;
  scale: FormControl<number | null>;
  format: FormControl<string | null>;
  showLegend: FormControl<boolean | null>;
}

@Component({
  selector: 'print-dialog',
  templateUrl: './print-dialog.component.html',
  styleUrls: ['./print-dialog.component.scss'],
})
export class PrintDialogComponent implements OnInit, OnDestroy {
  public readonly formGroup: FormGroup<PrintForm> = new FormGroup({
    title: new FormControl(),
    comment: new FormControl(),
    reportLayout: new FormControl('', [Validators.required]),
    reportOrientation: new FormControl(),
    dpi: new FormControl(0, [Validators.required]),
    rotation: new FormControl(0, [Validators.min(-90), Validators.max(90)]),
    scale: new FormControl(0, [Validators.required]),
    format: new FormControl('', [Validators.required]),
    showLegend: new FormControl(false, [Validators.required]),
  });

  public printCapabilities?: PrintCapabilities;
  public printCapabilitiesLoadingState: LoadingState;
  public printCreationLoadingState: LoadingState;
  public mapConfigState?: MapConfigState;
  public activeMapItems?: ActiveMapItem[];
  public uniqueReportLayouts: string[] = [];
  public readonly scales: number[] = this.configService.printConfig.scales;

  private drawings: Gb3StyledInternalDrawingRepresentation[] = [];
  private readonly isFormInitialized: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly store: Store,
    private readonly configService: ConfigService,
    private readonly printService: Gb3PrintService,
  ) {
    // disable the form until the print capabilities from the print API returns; otherwise the form is not complete.
    this.formGroup.disable();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngOnInit() {
    this.initSubscriptions();
  }

  public print() {
    if (!this.formGroup.valid || this.printCreationLoadingState === 'loading') {
      return;
    }

    const printData = this.getPrintData();
    const printCreation = this.printService.createPrintCreation(printData);
    this.store.dispatch(PrintActions.requestPrintCreation({creation: printCreation}));
  }

  public close() {
    this.store.dispatch(MapUiActions.hideMapSideDrawerContent());
  }

  private initSubscriptions() {
    // update form state and adjust print preview
    this.subscriptions.add(
      this.formGroup.valueChanges
        .pipe(
          combineLatestWith(this.isFormInitialized),
          filter(([_, isFormInitialized]) => isFormInitialized),
          tap(() => this.updateFormGroupControlsState()),
          // for the print preview we only use some properties and only if they've changed
          map(([value, _]) => ({
            reportLayout: value.reportLayout,
            reportOrientation: value.reportOrientation,
            scale: value.scale,
            rotation: value.rotation,
          })),
          distinctUntilChanged(
            (previous, current) =>
              previous.reportLayout === current.reportLayout &&
              previous.reportOrientation === current.reportOrientation &&
              previous.scale === current.scale &&
              previous.rotation === current.rotation,
          ),
          tap((value) => this.updatePrintPreview(value.reportLayout, value.reportOrientation, value.scale, value.rotation)),
        )
        .subscribe(),
    );

    // initialize the form (once)
    this.subscriptions.add(
      this.store
        .select(selectCapabilities)
        .pipe(
          filter((printCapabilities) => printCapabilities !== undefined),
          withLatestFrom(this.store.select(selectMapConfigState)),
          tap(([printCapabilities, mapConfigState]) => {
            this.printCapabilities = printCapabilities;
            this.initializeDefaultFormValues(printCapabilities, mapConfigState.scale);
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.store
        .select(selectCapabilitiesLoadingState)
        .pipe(
          tap((printCapabilitiesLoadingState) => {
            this.printCapabilitiesLoadingState = printCapabilitiesLoadingState;
            this.updateFormGroupState();
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.store
        .select(selectCreationLoadingState)
        .pipe(
          tap((printCreationLoadingState) => {
            this.printCreationLoadingState = printCreationLoadingState;
            this.updateFormGroupState();
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.store
        .select(selectMapConfigState)
        .pipe(tap((mapConfigState) => (this.mapConfigState = mapConfigState)))
        .subscribe(),
    );

    this.subscriptions.add(
      this.store
        .select(selectItems)
        .pipe(tap((activeMapItems) => (this.activeMapItems = activeMapItems)))
        .subscribe(),
    );

    this.subscriptions.add(
      this.store
        .select(selectDrawings)
        .pipe(tap((drawings) => (this.drawings = drawings)))
        .subscribe(),
    );
  }

  private updatePrintPreview(
    reportLayout: string | null | undefined,
    reportOrientation: string | null | undefined,
    scale: number | null | undefined,
    rotation: number | null | undefined,
  ) {
    let currentReport = this.printCapabilities?.reports.find(
      (report) => report.layout === reportLayout && report.orientation === reportOrientation,
    );
    if (!currentReport) {
      // find the current report by only using the layout because some reports don't have an orientation (e.g. 'kartenset')
      currentReport = this.printCapabilities?.reports.find((report) => report.layout === reportLayout);
    }
    if (currentReport && scale) {
      this.store.dispatch(
        PrintActions.showPrintPreview({
          scale: scale,
          height: currentReport.map.height,
          width: currentReport.map.width,
          rotation: rotation ?? 0,
        }),
      );
    }
  }

  private updateFormGroupState() {
    if (!this.isFormInitialized || this.printCapabilitiesLoadingState !== 'loaded' || this.printCreationLoadingState === 'loading') {
      this.formGroup.disable();
    } else {
      this.formGroup.enable();
      this.updateFormGroupControlsState();
    }
  }

  private updateFormGroupControlsState(emitEvent = false) {
    if (this.formGroup.disabled) {
      return;
    }

    const formGroupValue = this.formGroup.value;
    const currentReport = this.printCapabilities?.reports.find((report) => report.layout === formGroupValue.reportLayout);
    if (!currentReport?.orientation) {
      this.formGroup.controls.reportOrientation.disable({emitEvent});
    } else {
      this.formGroup.controls.reportOrientation.enable({emitEvent});
    }
  }

  private initializeDefaultFormValues(printCapabilities: PrintCapabilities | undefined, currentScale: number) {
    const defaultReport = printCapabilities?.reports[0];
    const defaultScale = this.configService.printConfig.scales.reduce(function (prev, curr) {
      return Math.abs(curr - currentScale) < Math.abs(prev - currentScale) ? curr : prev;
    });
    this.formGroup.setValue({
      title: '',
      comment: null,
      reportLayout: defaultReport?.layout ?? '',
      reportOrientation: defaultReport?.orientation ?? null,
      dpi: printCapabilities?.dpis[0] ?? 0,
      rotation: null,
      scale: defaultScale ?? 0,
      format: printCapabilities?.formats[0] ?? '',
      showLegend: false,
    });
    this.uniqueReportLayouts = printCapabilities ? [...new Set(printCapabilities.reports.map((report) => report.layout))] : [];
    this.updateFormGroupControlsState(true);
    this.isFormInitialized.next(true);
  }

  private getPrintData(): PrintData {
    return {
      format: this.getStringOrDefaultValue(this.formGroup.value.format),
      reportLayout: this.getStringOrDefaultValue(this.formGroup.value.reportLayout),
      reportOrientation: this.formGroup.value.reportOrientation ?? undefined,
      title: this.getStringOrDefaultValue(this.formGroup.value.title),
      comment: this.getStringOrDefaultValue(this.formGroup.value.comment),
      showLegend: this.getBooleanOrDefaultValue(this.formGroup.value.showLegend),
      scale: this.getNumberOrDefaultValue(this.formGroup.value.scale),
      dpi: this.getNumberOrDefaultValue(this.formGroup.value.dpi),
      rotation: this.getNumberOrDefaultValue(this.formGroup.value.rotation),
      mapCenter: {
        x: this.getNumberOrDefaultValue(this.mapConfigState?.center.x),
        y: this.getNumberOrDefaultValue(this.mapConfigState?.center.y),
      },
      activeBasemapId: this.getStringOrDefaultValue(this.mapConfigState?.activeBasemapId),
      activeMapItems: this.getArrayOrDefaultValue(this.activeMapItems),
      drawings: this.getArrayOrDefaultValue(this.drawings),
    };
  }

  private getStringOrDefaultValue(stringValue: string | null | undefined): string {
    if (stringValue === undefined || stringValue === null) {
      return '';
    }
    return stringValue;
  }

  private getNumberOrDefaultValue(numberValue: number | null | undefined): number {
    if (numberValue === undefined || numberValue === null) {
      return 0;
    }
    return numberValue;
  }

  private getBooleanOrDefaultValue(booleanValue: boolean | null | undefined): boolean {
    if (booleanValue === undefined || booleanValue === null) {
      return false;
    }
    return booleanValue;
  }

  private getArrayOrDefaultValue<T>(arrayValue: T[] | null | undefined): T[] {
    if (arrayValue === undefined || arrayValue === null) {
      return [];
    }
    return arrayValue;
  }
}
