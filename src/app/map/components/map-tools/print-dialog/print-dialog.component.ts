import {Component, OnDestroy, OnInit, ViewChild, inject} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {LoadingState} from '../../../../shared/types/loading-state.type';
import {Store} from '@ngrx/store';
import {BehaviorSubject, combineLatestWith, debounceTime, distinctUntilChanged, filter, Subscription, tap, withLatestFrom} from 'rxjs';
import {selectCreationLoadingState} from '../../../../state/map/reducers/print.reducer';
import {ReportOrientation, ReportType} from '../../../../shared/interfaces/print.interface';
import {PrintActions} from '../../../../state/map/actions/print.actions';
import {MapConfigState} from '../../../../state/map/states/map-config.state';
import {selectMapConfigState} from '../../../../state/map/reducers/map-config.reducer';
import {ActiveMapItem} from '../../../models/active-map-item.model';
import {selectItems} from '../../../../state/map/selectors/active-map-items.selector';
import {MapUiActions} from '../../../../state/map/actions/map-ui.actions';
import {map} from 'rxjs';
import {ConfigService} from '../../../../shared/services/config.service';
import {Gb3StyledInternalDrawingRepresentation} from '../../../../shared/interfaces/internal-drawing-representation.interface';
import {selectDrawings} from '../../../../state/map/reducers/drawing.reducer';
import {Gb3PrintService} from '../../../../shared/services/apis/gb3/gb3-print.service';
import {PrintData} from '../../../interfaces/print-data.interface';
import {DocumentFormat, DpiSetting, FileFormat} from '../../../../shared/interfaces/print-rules.interface';
import {printConfig} from '../../../../shared/configs/print.config';
import {MatStepper} from '@angular/material/stepper';
import {FormValueConversionUtils} from '../../../utils/form-value-conversion.utils';
import {AvailablePrintSettingsUtils} from '../../../utils/available-print-settings.utils';
import {selectIsMapSideDrawerOpen} from '../../../../state/map/reducers/map-ui.reducer';
import {NumberUtils} from '../../../../shared/utils/number.utils';

interface PrintForm {
  title: FormControl<string | null>;
  comment: FormControl<string | null>;
  reportType: FormControl<ReportType | null>;
  reportLayout: FormControl<string | null>;
  reportOrientation: FormControl<ReportOrientation | null>;
  dpi: FormControl<number | null>;
  rotation: FormControl<number | null>;
  scale: FormControl<string | null>;
  fileFormat: FormControl<string | null>;
  showLegend: FormControl<boolean | null>;
}

@Component({
  selector: 'print-dialog',
  templateUrl: './print-dialog.component.html',
  styleUrls: ['./print-dialog.component.scss'],
  standalone: false,
})
export class PrintDialogComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly configService = inject(ConfigService);
  private readonly printService = inject(Gb3PrintService);

  @ViewChild('stepper') private readonly stepper!: MatStepper;

  public readonly formGroup: FormGroup<PrintForm> = new FormGroup({
    title: new FormControl(),
    comment: new FormControl(),
    reportType: new FormControl(),
    reportLayout: new FormControl('', [Validators.required]),
    reportOrientation: new FormControl(),
    dpi: new FormControl(0, [Validators.required]),
    rotation: new FormControl(0, [Validators.min(-90), Validators.max(90)]),
    scale: new FormControl('', [Validators.required]),
    fileFormat: new FormControl('', [Validators.required]),
    showLegend: new FormControl(false, [Validators.required]),
  });

  public printCreationLoadingState: LoadingState;
  public mapConfigState?: MapConfigState;
  public activeMapItems?: ActiveMapItem[];
  public scale: number = 0;
  public readonly maxScale = this.configService.mapConfig.mapScaleConfig.maxScale;
  public readonly minScale = this.configService.mapConfig.mapScaleConfig.minScale;

  public availableReportLayouts: string[] = Object.values(DocumentFormat).filter((value) => typeof value === 'string') as string[];
  public availableDpiSettings: number[] = Object.values(DpiSetting).filter((value) => typeof value === 'number') as number[];
  public availableFileFormats: string[] = Object.values(FileFormat).filter((value) => typeof value === 'string') as string[];

  public linear = true;

  private drawings: Gb3StyledInternalDrawingRepresentation[] = [];
  private readonly isFormInitialized: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private readonly subscriptions: Subscription = new Subscription();

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

  public completeWithDefaultValues() {
    this.formGroup.setValue({
      title: this.formGroup.controls.title.value,
      comment: this.formGroup.controls.comment.value,
      reportType: printConfig.defaultPrintValues.reportType,
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
          combineLatestWith(this.isFormInitialized, this.store.select(selectIsMapSideDrawerOpen)),
          filter(([_, isFormInitialized, isMapSideDrawerOpen]) => isFormInitialized && isMapSideDrawerOpen),
          // for the print preview we only use some properties and only if they've changed.
          // The disabled properties are not showing in the 'value' object, thus we need to get them from the formGroup
          map(([value, _]) => ({
            reportLayout: value.reportLayout ?? this.formGroup.controls.reportLayout.value,
            reportOrientation: value.reportOrientation ?? this.formGroup.controls.reportOrientation.value,
            scale: value.scale ?? this.formGroup.controls.scale.value,
            rotation: value.rotation ?? this.formGroup.controls.rotation.value,
            fileFormat: value.fileFormat ?? this.formGroup.controls.fileFormat.value,
          })),
          distinctUntilChanged(
            // We do not check for scale here, because the scale is dealt with separately
            (previous, current) =>
              previous.reportLayout === current.reportLayout &&
              previous.reportOrientation === current.reportOrientation &&
              previous.rotation === current.rotation &&
              previous.fileFormat === current.fileFormat,
          ),
          tap((value) => this.updatePrintPreview(value.reportLayout, value.reportOrientation, parseInt(value.scale!), value.rotation)),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.formGroup.controls.scale.valueChanges
        .pipe(
          combineLatestWith(this.isFormInitialized, this.store.select(selectIsMapSideDrawerOpen)),
          filter(([_, isFormInitialized, isMapSideDrawerOpen]) => isFormInitialized && isMapSideDrawerOpen),
          map(([scaleInput]) => {
            let newScale = NumberUtils.parseNumberFromMixedString(scaleInput!);
            if (newScale === undefined || newScale === this.scale) {
              this.formGroup.controls.scale.setValue(this.scale.toString(), {emitEvent: false});
              return this.scale;
            }
            if (newScale > this.minScale) {
              newScale = this.minScale;
            }
            if (newScale < this.maxScale) {
              newScale = this.maxScale;
            }
            this.formGroup.controls.scale.setValue(newScale.toString(), {emitEvent: false});
            this.scale = newScale;
            return this.scale;
          }),
          distinctUntilChanged(),
          debounceTime(300),
          tap((scale) =>
            this.updatePrintPreview(
              this.formGroup.controls.reportLayout.value,
              this.formGroup.controls.reportOrientation.value,
              scale,
              this.formGroup.controls.rotation.value,
            ),
          ),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.formGroup.controls.reportType.valueChanges
        .pipe(
          filter((value): value is ReportType => value !== null),
          distinctUntilChanged(),
          withLatestFrom(this.formGroup.controls.showLegend.valueChanges),
          tap(([reportType, isLegendSelected]) => {
            this.availableReportLayouts = AvailablePrintSettingsUtils.updateUniqueReportLayouts(reportType);
            this.availableFileFormats = AvailablePrintSettingsUtils.updateUniqueFileTypes(reportType, isLegendSelected ?? true);
            this.updateFileTypeValueOnValueChange();

            if (reportType === 'mapset') {
              this.formGroup.setValue({
                title: this.formGroup.controls.title.value,
                comment: this.formGroup.controls.comment.value,
                reportType: reportType,
                reportLayout: DocumentFormat[printConfig.defaultMapSetPrintValues.documentFormat],
                reportOrientation: printConfig.defaultMapSetPrintValues.orientation,
                dpi: printConfig.defaultMapSetPrintValues.dpiSetting,
                // We are persistng the rotation and scale from the form
                rotation: this.formGroup.controls.rotation.value,
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
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.formGroup.controls.reportLayout.valueChanges
        .pipe(
          filter((value): value is string => !!value),
          distinctUntilChanged(),
          tap((reportLayout) => {
            this.availableDpiSettings = AvailablePrintSettingsUtils.updateUniqueDpiSettings(reportLayout);
            this.updateDpiValueOnValueChange();
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.formGroup.controls.showLegend.valueChanges
        .pipe(
          withLatestFrom(this.formGroup.controls.reportType.valueChanges),
          tap(([isLegendSelected, reportType]) => {
            this.availableFileFormats = AvailablePrintSettingsUtils.updateUniqueFileTypes(
              reportType ?? printConfig.defaultPrintValues.reportType,
              isLegendSelected ?? printConfig.defaultPrintValues.legend,
            );
            this.updateFileTypeValueOnValueChange();
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.store
        .select(selectCreationLoadingState)
        .pipe(tap((printCreationLoadingState) => (this.printCreationLoadingState = printCreationLoadingState)))
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
  }

  private updatePrintPreview(
    reportLayout: string | null | undefined,
    reportOrientation: ReportOrientation | null | undefined,
    scale: number | null | undefined,
    rotation: number | null | undefined,
  ) {
    const defaultDocumentFormat = DocumentFormat[printConfig.defaultPrintValues.documentFormat] as keyof typeof DocumentFormat;
    let currentReportSizing = printConfig.pixelSizes[defaultDocumentFormat].landscape;

    if (reportLayout) {
      const documentFormat = printConfig.pixelSizes[reportLayout as keyof typeof DocumentFormat];
      if (reportOrientation === 'landscape') {
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
    const roundedScale = Math.round(currentScale);
    this.formGroup.setValue({
      title: null,
      comment: null,
      reportType: printConfig.defaultPrintValues.reportType,
      reportLayout: DocumentFormat[defaultReport.documentFormat],
      reportOrientation: defaultReport.orientation,
      dpi: defaultReport.dpiSetting,
      rotation: defaultReport.rotation,
      scale: roundedScale.toString(),
      fileFormat: FileFormat[defaultReport.fileFormat],
      showLegend: defaultReport.legend,
    });
    this.scale = roundedScale;
    this.isFormInitialized.next(true);
    this.updateFormGroupState();
  }

  private getPrintData(): PrintData {
    return {
      format: FormValueConversionUtils.getStringOrDefaultValue(this.formGroup.controls.fileFormat.value),
      reportLayout: FormValueConversionUtils.getStringOrDefaultValue(this.formGroup.controls.reportLayout.value),
      reportType: FormValueConversionUtils.getStringOrDefaultValue(this.formGroup.controls.reportType.value),
      reportOrientation: this.formGroup.controls.reportOrientation.value ?? undefined,
      title: FormValueConversionUtils.getStringOrDefaultValue(this.formGroup.controls.title.value),
      comment: FormValueConversionUtils.getStringOrDefaultValue(this.formGroup.controls.comment.value),
      showLegend: FormValueConversionUtils.getBooleanOrDefaultValue(this.formGroup.controls.showLegend.value),
      scale: parseInt(FormValueConversionUtils.getStringOrDefaultValue(this.formGroup.controls.scale.value)),
      dpi: FormValueConversionUtils.getNumberOrDefaultValue(this.formGroup.controls.dpi.value),
      rotation: FormValueConversionUtils.getNumberOrDefaultValue(this.formGroup.controls.rotation.value),
      mapCenter: {
        x: FormValueConversionUtils.getNumberOrDefaultValue(this.mapConfigState?.center.x),
        y: FormValueConversionUtils.getNumberOrDefaultValue(this.mapConfigState?.center.y),
      },
      activeBasemapId: FormValueConversionUtils.getStringOrDefaultValue(this.mapConfigState?.activeBasemapId),
      activeMapItems: FormValueConversionUtils.getArrayOrDefaultValue(this.activeMapItems),
      drawings: FormValueConversionUtils.getArrayOrDefaultValue(this.drawings),
    };
  }

  private updateDpiValueOnValueChange() {
    if (this.availableDpiSettings.length === 1) {
      this.formGroup.controls.dpi.disable({emitEvent: false});
    } else {
      this.formGroup.controls.dpi.enable();
    }
    const isSelectedDpiSettingAllowed = this.availableDpiSettings.some(
      (availableDpiSetting) => availableDpiSetting === this.formGroup.controls.dpi.value,
    );
    if (!isSelectedDpiSettingAllowed) {
      this.formGroup.controls.dpi.setValue(this.availableDpiSettings[0]);
    }
  }

  private updateFileTypeValueOnValueChange() {
    if (this.availableFileFormats.length === 1) {
      this.formGroup.controls.fileFormat.disable({emitEvent: false});
    } else {
      this.formGroup.controls.fileFormat.enable();
    }
    const isSelectedFileFormatAllowed = this.availableFileFormats.some(
      (availableFileFormat) => availableFileFormat === this.formGroup.controls.fileFormat.value,
    );
    if (!isSelectedFileFormatAllowed) {
      this.formGroup.controls.fileFormat.setValue(this.availableFileFormats[0]);
    }
  }
}
