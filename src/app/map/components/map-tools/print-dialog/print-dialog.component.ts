import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LoadingState} from '../../../../shared/types/loading-state.type';
import {Store} from '@ngrx/store';
import {BehaviorSubject, combineLatestWith, debounceTime, distinctUntilChanged, filter, Subscription, tap} from 'rxjs';
import {selectCapabilitiesValidCombinations, selectCreationLoadingState} from '../../../../state/map/reducers/print.reducer';
import {ReportOrientation} from '../../../../shared/interfaces/print.interface';
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
import {FormValueConversionUtils} from '../../../utils/form-value-conversion.utils';
import {selectIsMapSideDrawerOpen} from '../../../../state/map/reducers/map-ui.reducer';
import {NumberUtils} from '../../../../shared/utils/number.utils';
import {MatIconButton, MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatFormField, MatLabel, MatInput, MatHint, MatError, MatPrefix} from '@angular/material/input';
import {MatRadioGroup, MatRadioButton} from '@angular/material/radio';
import {MatSelect} from '@angular/material/select';
import {MatOption} from '@angular/material/autocomplete';
import {MatCheckbox} from '@angular/material/checkbox';
import {LoadingAndProcessBarComponent} from '../../../../shared/components/loading-and-process-bar/loading-and-process-bar.component';
import {PrintSettingsOptionsProviderService} from 'src/app/map/services/print-settings-options-provider.service';
import {PrintForm} from 'src/app/shared/interfaces/print-form.interface';

@Component({
  selector: 'print-dialog',
  templateUrl: './print-dialog.component.html',
  styleUrls: ['./print-dialog.component.scss'],
  imports: [
    MatIconButton,
    MatIcon,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatRadioGroup,
    MatRadioButton,
    MatSelect,
    MatOption,
    MatHint,
    MatError,
    MatPrefix,
    MatCheckbox,
    LoadingAndProcessBarComponent,
  ],
})
export class PrintDialogComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly configService = inject(ConfigService);
  private readonly printService = inject(Gb3PrintService);
  private readonly printSettingsOptionsProvider = inject(PrintSettingsOptionsProviderService);

  public readonly formGroup = new FormGroup<PrintForm>({
    title: new FormControl(),
    comment: new FormControl(),
    reportType: new FormControl(),
    layout: new FormControl(DocumentFormat.A4, [Validators.required]),
    reportOrientation: new FormControl(),
    dpi: new FormControl(null, [Validators.required]),
    rotation: new FormControl(0, [Validators.min(-90), Validators.max(90)]),
    scale: new FormControl('', [Validators.required]),
    fileFormat: new FormControl(FileFormat.pdf, [Validators.required]),
    showLegend: new FormControl(false, [Validators.required]),
  });

  public printCreationLoadingState: LoadingState;
  public mapConfigState?: MapConfigState;
  public activeMapItems?: ActiveMapItem[];
  public scale: number = 0;
  public readonly maxScale = this.configService.mapConfig.mapScaleConfig.maxScale;
  public readonly minScale = this.configService.mapConfig.mapScaleConfig.minScale;

  public allFileFormats: FileFormat[] = [];
  public allDpiSettings: DpiSetting[] = [];
  public allLayouts: DocumentFormat[] = [];
  public allOrientations: ReportOrientation[] = [];

  public availableFileFormats: FileFormat[] = [];
  public availableDpiSettings: DpiSetting[] = [];
  public availableLayouts: DocumentFormat[] = [];
  public availableOrientations: ReportOrientation[] = [];

  public linear = true;

  private drawings: Gb3StyledInternalDrawingRepresentation[] = [];
  private readonly isFormInitialized: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private readonly subscriptions: Subscription = new Subscription();

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngOnInit() {
    this.initSubscriptions();

    this.store.dispatch(PrintActions.fetchCapabilitiesValidCombinations());

    this.setDefaults();
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

  public setDefaults() {
    this.formGroup.setValue({
      title: this.formGroup.controls.title.value,
      comment: this.formGroup.controls.comment.value,
      reportType: printConfig.defaultPrintValues.reportType,
      layout: DocumentFormat[printConfig.defaultPrintValues.documentFormat],
      reportOrientation: printConfig.defaultPrintValues.orientation,
      dpi: printConfig.defaultPrintValues.dpiSetting,
      rotation: printConfig.defaultPrintValues.rotation,
      scale: this.formGroup.controls.scale.value,
      fileFormat: FileFormat[printConfig.defaultPrintValues.fileFormat],
      showLegend: printConfig.defaultPrintValues.legend,
    });
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
            layout: value.layout ?? this.formGroup.controls.layout.value,
            reportOrientation: value.reportOrientation ?? this.formGroup.controls.reportOrientation.value,
            scale: value.scale ?? this.formGroup.controls.scale.value,
            rotation: value.rotation ?? this.formGroup.controls.rotation.value,
            fileFormat: value.fileFormat ?? this.formGroup.controls.fileFormat.value,
          })),
          distinctUntilChanged(
            // We do not check for scale here, because the scale is dealt with separately
            (previous, current) =>
              previous.layout === current.layout &&
              previous.reportOrientation === current.reportOrientation &&
              previous.rotation === current.rotation &&
              previous.fileFormat === current.fileFormat,
          ),
          tap((value) =>
            this.updatePrintPreview(
              value.layout,
              value.reportOrientation,
              value.scale !== null ? parseInt(value.scale) : 0,
              value.rotation,
            ),
          ),
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
              this.formGroup.controls.layout.value,
              this.formGroup.controls.reportOrientation.value,
              scale,
              this.formGroup.controls.rotation.value,
            ),
          ),
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

    this.subscriptions.add(
      this.store
        .select(selectCapabilitiesValidCombinations)
        .pipe(
          tap((capabilitiesValidCombinations) => {
            if (!capabilitiesValidCombinations) {
              return;
            }

            this.allDpiSettings = this.printSettingsOptionsProvider.getUnqiueOptions<'dpi'>(capabilitiesValidCombinations, 'dpi');
            this.allLayouts = this.printSettingsOptionsProvider.getUnqiueOptions<'layout'>(capabilitiesValidCombinations, 'layout');
            this.allOrientations = this.printSettingsOptionsProvider.getUnqiueOptions<'report_orientation'>(
              capabilitiesValidCombinations,
              'report_orientation',
            );
            this.allFileFormats = this.printSettingsOptionsProvider.getUnqiueOptions<'file_format'>(
              capabilitiesValidCombinations,
              'file_format',
            );
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.formGroup.valueChanges
        .pipe(
          combineLatestWith(this.store.select(selectCapabilitiesValidCombinations)),
          tap(([formValue, allCombinations]) => {
            if (!allCombinations) {
              return;
            }

            const available = this.printSettingsOptionsProvider.filterOptions(formValue, allCombinations, [
              'reportType',
              'layout',
              'reportOrientation',
              'dpi',
              'showLegend',
              'fileFormat',
            ]);

            this.availableDpiSettings = available.dpi;
            this.availableFileFormats = available.fileFormat;
            this.availableLayouts = available.layout;
            this.availableOrientations = available.reportOrientation;

            if (formValue.dpi && !this.availableDpiSettings.includes(formValue.dpi)) {
              this.formGroup.controls.dpi.setValue(this.availableDpiSettings[0]);
            }

            if (formValue.fileFormat && !this.availableFileFormats.includes(formValue.fileFormat)) {
              this.formGroup.controls.fileFormat.setValue(this.availableFileFormats[0]);
            }

            if (formValue.layout && !this.availableLayouts.includes(formValue.layout)) {
              this.formGroup.controls.layout.setValue(this.availableLayouts[0]);
            }

            if (formValue.reportOrientation && !this.availableOrientations.includes(formValue.reportOrientation)) {
              this.formGroup.controls.reportOrientation.setValue(this.availableOrientations[0]);
            }
          }),
        )
        .subscribe(),
    );
  }

  private updatePrintPreview(
    layout: string | null | undefined,
    reportOrientation: ReportOrientation | null | undefined,
    scale: number | null | undefined,
    rotation: number | null | undefined,
  ) {
    const defaultDocumentFormat = DocumentFormat[printConfig.defaultPrintValues.documentFormat] as keyof typeof DocumentFormat;
    let currentReportSizing = printConfig.pixelSizes[defaultDocumentFormat].landscape;

    if (layout) {
      const documentFormat = printConfig.pixelSizes[layout as keyof typeof DocumentFormat];
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
      layout: DocumentFormat[defaultReport.documentFormat],
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
      reportLayout: FormValueConversionUtils.getStringOrDefaultValue(this.formGroup.controls.layout.value),
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
}
