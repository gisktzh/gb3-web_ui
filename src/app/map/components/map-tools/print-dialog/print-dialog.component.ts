import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {LoadingState} from '../../../../shared/types/loading-state.type';
import {Store} from '@ngrx/store';
import {BehaviorSubject, combineLatestWith, distinctUntilChanged, filter, Subscription, tap} from 'rxjs';
import {selectCreationLoadingState} from '../../../../state/map/reducers/print.reducer';
import {ReportOrientation, ReportType} from '../../../../shared/interfaces/print.interface';
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
import {DocumentFormat, FileFormat, printRules} from '../../../../shared/interfaces/print-rules.interface';
import {printConfig} from '../../../../shared/configs/print.config';
import {MatStepper} from '@angular/material/stepper';
import {StepperSelectionEvent} from '@angular/cdk/stepper';

interface PrintForm {
  title: FormControl<string | null>;
  comment: FormControl<string | null>;
  reportType: FormControl<ReportType | null>;
  reportLayout: FormControl<string | null>;
  reportOrientation: FormControl<ReportOrientation | null>;
  dpi: FormControl<number | null>;
  rotation: FormControl<number | null>;
  scale: FormControl<number | null>;
  fileFormat: FormControl<string | null>;
  showLegend: FormControl<boolean | null>;
}

@Component({
  selector: 'print-dialog',
  templateUrl: './print-dialog.component.html',
  styleUrls: ['./print-dialog.component.scss'],
})
export class PrintDialogComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('stepper') private readonly stepper!: MatStepper;

  public readonly formGroup: FormGroup<PrintForm> = new FormGroup({
    title: new FormControl(),
    comment: new FormControl(),
    reportType: new FormControl(),
    reportLayout: new FormControl('', [Validators.required]),
    reportOrientation: new FormControl(),
    dpi: new FormControl(0, [Validators.required]),
    rotation: new FormControl(0, [Validators.min(-90), Validators.max(90)]),
    scale: new FormControl(0, [Validators.required]),
    fileFormat: new FormControl('', [Validators.required]),
    showLegend: new FormControl(false, [Validators.required]),
  });

  public printCreationLoadingState: LoadingState;
  public mapConfigState?: MapConfigState;
  public activeMapItems?: ActiveMapItem[];
  public availableReportLayouts: string[] = Object.values(DocumentFormat).filter((value) => typeof value === 'string') as string[];
  public availableDpiSettings: number[] = []; // changes only if ReportLayout changes
  public availableFileTypes: string[] = Object.values(FileFormat).filter((value) => typeof value === 'string') as string[];

  public readonly scales: number[] = this.configService.printConfig.scales;
  public linear = true;

  private drawings: Gb3StyledInternalDrawingRepresentation[] = [];
  private readonly isFormInitialized: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isLegendSelected: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public selectedReportType: BehaviorSubject<ReportType> = new BehaviorSubject<ReportType>('standard');
  public selectedReportLayout: BehaviorSubject<string> = new BehaviorSubject<string>('A4');
  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private readonly store: Store,
    private readonly configService: ConfigService,
    private readonly printService: Gb3PrintService,
  ) {}

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngAfterViewInit() {
    this.subscriptions.add(
      this.stepper.selectionChange.subscribe((stepEvent: StepperSelectionEvent) => {
        console.log(stepEvent.selectedIndex);
        this.stepper._steps.toArray().forEach((step, index) => {
          if (index > stepEvent.selectedIndex) {
            step.completed = false;
          } else {
            step.completed = true;
          }
        });
      }),
    );
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

  public finishWithDefaultValues() {
    this.formGroup.setValue({
      title: this.formGroup.controls.title.value,
      comment: this.formGroup.controls.comment.value,
      reportType: 'standard',
      reportLayout: DocumentFormat[printConfig.defaultPrintValues.documentFormat],
      reportOrientation: printConfig.defaultPrintValues.orientation,
      dpi: printConfig.defaultPrintValues.dpiSetting,
      rotation: printConfig.defaultPrintValues.rotation,
      scale: this.formGroup.controls.scale.value,
      fileFormat: FileFormat[printConfig.defaultPrintValues.fileFormat],
      showLegend: printConfig.defaultPrintValues.legend,
    });

    // Move the stepper to the last step and mark all steps as completed
    this.linear = false;
    this.stepper._steps.toArray().forEach((step) => {
      step.completed = true;
    });
    this.stepper.selectedIndex = this.stepper._steps.length - 1;
    this.linear = true;
  }

  private initSubscriptions() {
    // update form state and adjust print preview
    this.subscriptions.add(
      this.formGroup.valueChanges
        .pipe(
          combineLatestWith(this.isFormInitialized),
          filter(([_, isFormInitialized]) => isFormInitialized),
          // tap(([value, _]) => {
          //   this.updateUniqueDpiSettings(value.reportLayout ?? DocumentFormat[printConfig.defaultPrintValues.documentFormat]);
          // }),
          // for the print preview we only use some properties and only if they've changed
          map(([value, _]) => ({
            reportLayout: value.reportLayout,
            reportOrientation: value.reportOrientation,
            scale: value.scale,
            rotation: value.rotation,
            fileFormat: value.fileFormat,
          })),
          distinctUntilChanged(
            (previous, current) =>
              previous.reportLayout === current.reportLayout &&
              previous.reportOrientation === current.reportOrientation &&
              previous.scale === current.scale &&
              previous.rotation === current.rotation &&
              previous.fileFormat === current.fileFormat,
          ),
          tap((value) => {
            console.log(value);
            this.updatePrintPreview(value.reportLayout, value.reportOrientation, value.scale, value.rotation);
          }),
        )
        .subscribe(),
    );

    // this.subscriptions.add(this.formGroup.controls.reportLayout.valueChanges.pipe(tap((value) => console.log(value))).subscribe());

    this.subscriptions.add(
      this.store
        .select(selectCreationLoadingState)
        .pipe(
          tap((printCreationLoadingState) => {
            this.printCreationLoadingState = printCreationLoadingState;
            // this.updateFormGroupState();
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.store
        .select(selectMapConfigState)
        .pipe(
          tap((mapConfigState) => {
            this.mapConfigState = mapConfigState;
            if (!this.isFormInitialized.value) {
              this.initializeDefaultFormValues(mapConfigState.scale);
            }
          }),
        )
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

    this.subscriptions.add(
      this.selectedReportType.pipe().subscribe((reportType) => {
        this.updateUniqueReportLayouts(reportType);
        this.updateUniqueFileTypes(reportType, this.isLegendSelected.value);

        if (reportType === 'mapset') {
          this.formGroup.setValue({
            title: this.formGroup.controls.title.value,
            comment: this.formGroup.controls.comment.value,
            reportType: reportType,
            reportLayout: DocumentFormat[printConfig.defaultMapSetPrintValues.documentFormat],
            reportOrientation: printConfig.defaultMapSetPrintValues.orientation,
            dpi: printConfig.defaultMapSetPrintValues.dpiSetting,
            rotation: printConfig.defaultMapSetPrintValues.rotation,
            scale: this.formGroup.controls.scale.value,
            fileFormat: FileFormat[printConfig.defaultMapSetPrintValues.fileFormat],
            showLegend: printConfig.defaultMapSetPrintValues.legend,
          });

          this.formGroup.controls.fileFormat.disable({emitEvent: false});
          this.formGroup.controls.reportOrientation.disable({emitEvent: false});
          this.formGroup.controls.reportLayout.disable({emitEvent: false});
        } else {
          this.formGroup.controls.reportLayout.enable();
          this.formGroup.controls.reportOrientation.enable();
          if (!this.formGroup.controls.showLegend.value) {
            this.formGroup.controls.fileFormat.enable();
          }
        }
      }),
    );

    this.subscriptions.add(
      this.isLegendSelected.pipe().subscribe((isLegendSelected) => {
        console.log('isLegendSelected', isLegendSelected);
        this.updateUniqueFileTypes(this.formGroup.value.reportType ?? 'standard', isLegendSelected);
      }),
    );

    this.subscriptions.add(
      this.selectedReportLayout.pipe().subscribe((reportLayout) => {
        console.log(reportLayout);
        console.log(this.stepper);
        this.updateUniqueDpiSettings(reportLayout);
      }),
    );
  }

  private updatePrintPreview(
    reportLayout: string | null | undefined,
    reportOrientation: string | null | undefined,
    scale: number | null | undefined,
    rotation: number | null | undefined,
  ) {
    const defaultDocumentFormat = DocumentFormat[printConfig.defaultPrintValues.documentFormat] as keyof typeof DocumentFormat;
    let currentReportSizing = printConfig.pixelSizes[defaultDocumentFormat].landscape;

    if (reportLayout) {
      const documentFormat = printConfig.pixelSizes[reportLayout as keyof typeof DocumentFormat];
      if (reportOrientation === 'quer') {
        currentReportSizing = documentFormat.landscape;
      } else {
        currentReportSizing = documentFormat.portrait;
      }
    }

    if (currentReportSizing && scale) {
      this.store.dispatch(
        PrintActions.showPrintPreview({
          scale: scale,
          height: currentReportSizing.height,
          width: currentReportSizing.width,
          rotation: rotation ?? 0,
        }),
      );
    }
  }

  private updateFormGroupState() {
    if (!this.isFormInitialized) {
      this.formGroup.disable();
    } else {
      this.formGroup.enable();
    }
  }

  private initializeDefaultFormValues(currentScale: number) {
    const defaultReport = printConfig.defaultPrintValues;
    const defaultScale = this.configService.printConfig.scales.reduce(function (prev, curr) {
      return Math.abs(curr - currentScale) < Math.abs(prev - currentScale) ? curr : prev;
    });
    this.formGroup.setValue({
      title: '',
      comment: null,
      reportType: 'standard',
      reportLayout: DocumentFormat[defaultReport.documentFormat],
      reportOrientation: defaultReport.orientation,
      dpi: defaultReport.dpiSetting,
      rotation: defaultReport.rotation,
      scale: defaultScale ?? 0,
      fileFormat: FileFormat[defaultReport.fileFormat],
      showLegend: defaultReport.legend,
    });
    this.isFormInitialized.next(true);
    this.updateFormGroupState();
  }

  private getPrintData(): PrintData {
    return {
      format: this.getStringOrDefaultValue(this.formGroup.controls.fileFormat.value),
      reportLayout: this.getStringOrDefaultValue(this.formGroup.controls.reportLayout.value),
      reportType: this.getStringOrDefaultValue(this.formGroup.controls.reportType.value),
      reportOrientation: this.formGroup.controls.reportOrientation.value ?? undefined,
      title: this.getStringOrDefaultValue(this.formGroup.controls.title.value),
      comment: this.getStringOrDefaultValue(this.formGroup.controls.comment.value),
      showLegend: this.getBooleanOrDefaultValue(this.formGroup.controls.showLegend.value),
      scale: this.getNumberOrDefaultValue(this.formGroup.controls.scale.value),
      dpi: this.getNumberOrDefaultValue(this.formGroup.controls.dpi.value),
      rotation: this.getNumberOrDefaultValue(this.formGroup.controls.rotation.value),
      mapCenter: {
        x: this.getNumberOrDefaultValue(this.mapConfigState?.center.x),
        y: this.getNumberOrDefaultValue(this.mapConfigState?.center.y),
      },
      activeBasemapId: this.getStringOrDefaultValue(this.mapConfigState?.activeBasemapId),
      activeMapItems: this.getArrayOrDefaultValue(this.activeMapItems),
      drawings: this.getArrayOrDefaultValue(this.drawings),
    };
  }

  private updateUniqueReportLayouts(reportType: ReportType) {
    this.availableReportLayouts =
      reportType === 'standard'
        ? (Object.values(DocumentFormat).filter((value) => typeof value === 'string') as string[])
        : printRules.availableDocumentFormatsForMapSet.map((layout) => DocumentFormat[layout]);
  }

  private updateUniqueDpiSettings(reportLayout: string) {
    this.availableDpiSettings = printRules.reportFormats.find(
      (reportFormat) => DocumentFormat[reportFormat.documentFormat] === reportLayout,
    )!.availableDpiSettings;

    if (this.availableDpiSettings.length === 1) {
      this.formGroup.controls.dpi.disable({emitEvent: false});
    } else {
      this.formGroup.controls.dpi.enable();
    }
    this.formGroup.controls.dpi.setValue(this.availableDpiSettings[0]);
  }

  private updateUniqueFileTypes(reportType: ReportType, showLegend: boolean) {
    const allAvailableFileFormats = Object.values(FileFormat).filter((value) => typeof value === 'string') as string[];
    const availableFileFormatsForLegend = showLegend
      ? printRules.availableFileFormatsForLegend.map((fileFormat) => FileFormat[fileFormat])
      : allAvailableFileFormats;
    const availableFileFormatsForMapSet =
      reportType === 'mapset'
        ? printRules.availableFileFormatsForMapSet.map((fileFormat) => FileFormat[fileFormat])
        : allAvailableFileFormats;

    this.availableFileTypes = allAvailableFileFormats.filter(
      (format) => availableFileFormatsForLegend.includes(format) && availableFileFormatsForMapSet.includes(format),
    );

    if (this.availableFileTypes.length === 1) {
      this.formGroup.controls.fileFormat.disable({emitEvent: false});
    } else {
      this.formGroup.controls.fileFormat.enable();
    }
    this.formGroup.controls.fileFormat.setValue(this.availableFileTypes[0]);
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
