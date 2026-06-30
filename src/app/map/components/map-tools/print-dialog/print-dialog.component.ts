import {Component, computed, effect, inject, signal} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {Store} from '@ngrx/store';
import {selectCapabilitiesValidCombinations, selectCreationLoadingState} from '../../../../state/map/reducers/print.reducer';
import {ReportOrientation} from '../../../../shared/interfaces/print.interface';
import {PrintActions} from '../../../../state/map/actions/print.actions';
import {selectMapConfigState} from '../../../../state/map/reducers/map-config.reducer';
import {ActiveMapItem} from '../../../models/active-map-item.model';
import {selectItems} from '../../../../state/map/selectors/active-map-items.selector';
import {MapUiActions} from '../../../../state/map/actions/map-ui.actions';
import {ConfigService} from '../../../../shared/services/config.service';
import {selectDrawings} from '../../../../state/map/reducers/drawing.reducer';
import {Gb3PrintService} from '../../../../shared/services/apis/gb3/gb3-print.service';
import {PrintData} from '../../../interfaces/print-data.interface';
import {DocumentFormat, DpiSetting, FileFormat} from '../../../../shared/interfaces/print-rules.interface';
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
import {PrintFormAvailableCheckPriorityList, PrintFormValues} from 'src/app/shared/interfaces/print-form.interface';
import {MAP_SERVICE} from 'src/app/app.tokens';
import {MapService} from 'src/app/map/interfaces/map.service';
import {DrawingLayerPrefix, InternalDrawingLayer} from 'src/app/shared/enums/drawing-layer.enum';
import {ActiveMapItemFactory} from 'src/app/shared/factories/active-map-item.factory';

import {form, max, min, required, validate, FormField, FormRoot} from '@angular/forms/signals';
import {printConfig} from 'src/app/shared/configs/print.config';

const AVAILABLE_VALUES_CHECK_PRIORITY: PrintFormAvailableCheckPriorityList = [
  'reportType',
  'layout',
  'reportOrientation',
  'dpi',
  'showLegend',
  'fileFormat',
];

@Component({
  selector: 'print-dialog',
  templateUrl: './print-dialog.component.html',
  styleUrls: ['./print-dialog.component.scss'],
  imports: [
    MatIconButton,
    MatIcon,
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
    FormField,
    FormRoot,
  ],
})
export class PrintDialogComponent {
  private readonly store = inject(Store);
  private readonly configService = inject(ConfigService);
  private readonly printService = inject(Gb3PrintService);
  private readonly printSettingsOptionsProvider = inject(PrintSettingsOptionsProviderService);
  private readonly mapService = inject<MapService>(MAP_SERVICE);

  public readonly printFormModel = signal<PrintFormValues>({
    title: '',
    comment: '',
    reportType: printConfig.defaultPrintValues.reportType,
    layout: printConfig.defaultPrintValues.documentFormat,
    reportOrientation: printConfig.defaultPrintValues.orientation,
    dpi: printConfig.defaultPrintValues.dpiSetting,
    rotation: printConfig.defaultPrintValues.rotation,
    scale: '',
    fileFormat: printConfig.defaultPrintValues.fileFormat,
    showLegend: printConfig.defaultPrintValues.legend,
  });

  public printForm = form(
    this.printFormModel,
    (fieldPath) => {
      required(fieldPath.layout);
      required(fieldPath.dpi);
      required(fieldPath.scale);
      required(fieldPath.fileFormat);
      required(fieldPath.showLegend);

      min(fieldPath.rotation, -90);
      max(fieldPath.rotation, 90);

      validate(fieldPath.fileFormat, (field) => {
        const value = field.value();
        return value && this.availableFileFormats().includes(value)
          ? null
          : {
              kind: 'incorrect',
            };
      });

      validate(fieldPath.dpi, (field) => {
        const value = field.value();
        return value && this.availableDpiSettings().includes(value)
          ? null
          : {
              kind: 'incorrect',
            };
      });

      validate(fieldPath.layout, (field) => {
        const value = field.value();
        return value && this.availableLayouts().includes(value)
          ? null
          : {
              kind: 'incorrect',
            };
      });

      validate(fieldPath.reportOrientation, (field) => {
        const value = field.value();
        return value && this.availableOrientations().includes(value)
          ? null
          : {
              kind: 'incorrect',
            };
      });
    },
    {
      submission: {
        action: () => {
          return Promise.resolve(this.print());
        },
      },
    },
  );

  public readonly printCreationLoadingState = this.store.selectSignal(selectCreationLoadingState);
  public readonly mapConfigState = this.store.selectSignal(selectMapConfigState);
  public readonly activeMapItems = this.store.selectSignal(selectItems);
  public readonly drawings = this.store.selectSignal(selectDrawings);
  public readonly isMapSlideDrawerOpen = this.store.selectSignal(selectIsMapSideDrawerOpen);
  public readonly maxScale = this.configService.mapConfig.mapScaleConfig.maxScale;
  public readonly minScale = this.configService.mapConfig.mapScaleConfig.minScale;

  public readonly capabilitiesValidCombinations = this.store.selectSignal(selectCapabilitiesValidCombinations);

  public readonly allFileFormats = computed<FileFormat[]>(() => {
    return this.printSettingsOptionsProvider.getUnqiueOptions<'file_format'>(this.capabilitiesValidCombinations(), 'file_format');
  });
  public readonly allDpiSettings = computed<DpiSetting[]>(() => {
    return this.printSettingsOptionsProvider.getUnqiueOptions<'dpi'>(this.capabilitiesValidCombinations(), 'dpi');
  });
  public readonly allLayouts = computed<DocumentFormat[]>(() => {
    return this.printSettingsOptionsProvider.getUnqiueOptions<'layout'>(this.capabilitiesValidCombinations(), 'layout');
  });
  public readonly allOrientations = computed<ReportOrientation[]>(() => {
    return this.printSettingsOptionsProvider.getUnqiueOptions<'report_orientation'>(
      this.capabilitiesValidCombinations(),
      'report_orientation',
    );
  });
  public readonly availableOptions = computed(() => {
    const allCombinations = this.capabilitiesValidCombinations() ?? [];
    return this.printSettingsOptionsProvider.filterOptions(this.printFormModel(), allCombinations, AVAILABLE_VALUES_CHECK_PRIORITY);
  });
  public readonly availableFileFormats = computed<FileFormat[]>(() => {
    return this.availableOptions()?.fileFormat ?? [];
  });
  public readonly availableDpiSettings = computed<DpiSetting[]>(() => {
    return this.availableOptions()?.dpi ?? [];
  });
  public readonly availableLayouts = computed<DocumentFormat[]>(() => {
    return this.availableOptions()?.layout ?? [];
  });
  public readonly availableOrientations = computed<ReportOrientation[]>(() => {
    return this.availableOptions()?.reportOrientation ?? [];
  });

  constructor() {
    this.store.dispatch(PrintActions.fetchCapabilitiesValidCombinations());

    effect(() => {
      const mapConfigState = this.mapConfigState();
      if (mapConfigState && !this.printFormModel().scale) {
        queueMicrotask(() => {
          this.printForm.scale().value.set(Math.round(mapConfigState.scale).toString());
        });
      }
    });

    effect(() => {
      const fileFormatFormValue = this.printFormModel().fileFormat;
      const availableSettings = this.availableFileFormats();
      if (fileFormatFormValue && availableSettings.length > 0 && !availableSettings.includes(fileFormatFormValue)) {
        queueMicrotask(() => {
          this.printForm.fileFormat().value.set(availableSettings[0]);
        });
      }
    });

    effect(() => {
      const dpiFormValue = this.printFormModel().dpi;
      const availableSettings = this.availableDpiSettings();
      if (dpiFormValue && availableSettings.length && !availableSettings.includes(dpiFormValue)) {
        queueMicrotask(() => {
          this.printForm.dpi().value.set(availableSettings[0]);
        });
      }
    });

    effect(() => {
      const layoutFormValue = this.printFormModel().layout;
      const availableSettings = this.availableLayouts();
      if (layoutFormValue && availableSettings.length && !availableSettings.includes(layoutFormValue)) {
        queueMicrotask(() => {
          this.printForm.layout().value.set(availableSettings[0]);
        });
      }
    });

    effect(() => {
      const orientationFormValue = this.printFormModel().reportOrientation;
      const availableSettings = this.availableOrientations();
      if (orientationFormValue && availableSettings.length && !availableSettings.includes(orientationFormValue)) {
        queueMicrotask(() => {
          this.printForm.reportOrientation().value.set(availableSettings[0]);
        });
      }
    });

    effect(() => {
      if (!this.isMapSlideDrawerOpen()) {
        return;
      }

      const formValue = this.printFormModel();
      const scaleNumeric = NumberUtils.parseNumberFromMixedString(formValue.scale ?? '');

      if (scaleNumeric) {
        // Scale works in reverse, which is counter intuitive here, since it's technically 1/scale:
        // The minimum scale is how small features on the map can actually get.
        // We don't want the scale to be any smaller.
        if (scaleNumeric > this.minScale) {
          queueMicrotask(() => {
            this.printForm.scale().value.set(this.minScale.toString());
          });
        }

        if (scaleNumeric < this.maxScale) {
          queueMicrotask(() => {
            this.printForm.scale().value.set(this.maxScale.toString());
          });
        }
      }

      this.updatePrintPreview(
        formValue.layout,
        formValue.reportOrientation,
        formValue.scale === null ? 0 : Number.parseInt(formValue.scale),
        formValue.rotation,
      );
    });
  }

  public print() {
    if (!this.printForm().valid() || this.printCreationLoadingState() === 'loading') {
      return;
    }

    this.store.dispatch(PrintActions.requestPrintCreation({creation: this.printService.createPrintCreation(this.getPrintData())}));
  }

  public close() {
    this.store.dispatch(MapUiActions.hideMapSideDrawerContent());
  }

  private updatePrintPreview(
    layout: string | null | undefined,
    reportOrientation: ReportOrientation | null | undefined,
    scale: number | null | undefined,
    rotation: number | null | undefined,
  ) {
    const currentReportSizing = this.printService.getReportSizing(layout, reportOrientation);

    if (currentReportSizing && scale !== null && scale !== undefined && rotation !== null && rotation !== undefined) {
      this.store.dispatch(
        PrintActions.showPrintPreview({
          scale,
          height: currentReportSizing.height,
          width: currentReportSizing.width,
          rotation,
        }),
      );
    }
  }

  private getPrintData(): PrintData {
    const searchHighlightDrawings = this.mapService.getInternalDrawingLayerGraphics(InternalDrawingLayer.SearchResultHighlight);
    let searchHighlightMapItems: ActiveMapItem[] = [];
    if (searchHighlightDrawings.length) {
      searchHighlightMapItems = [
        ActiveMapItemFactory.createDrawingMapItem(InternalDrawingLayer.SearchResultHighlight, DrawingLayerPrefix.Internal),
      ];
    }

    return {
      format: FormValueConversionUtils.getStringOrDefaultValue(this.printFormModel().fileFormat),
      reportLayout: FormValueConversionUtils.getStringOrDefaultValue(this.printFormModel().layout),
      reportType: FormValueConversionUtils.getStringOrDefaultValue(this.printFormModel().reportType),
      reportOrientation: this.printFormModel().reportOrientation ?? undefined,
      title: FormValueConversionUtils.getStringOrDefaultValue(this.printFormModel().title),
      comment: FormValueConversionUtils.getStringOrDefaultValue(this.printFormModel().comment),
      showLegend: FormValueConversionUtils.getBooleanOrDefaultValue(this.printFormModel().showLegend),
      scale: Number.parseInt(FormValueConversionUtils.getStringOrDefaultValue(this.printFormModel().scale)),
      mapScale:
        this.mapConfigState()?.scale || Number.parseInt(FormValueConversionUtils.getStringOrDefaultValue(this.printFormModel().scale)),
      dpi: FormValueConversionUtils.getNumberOrDefaultValue(this.printFormModel().dpi),
      rotation: FormValueConversionUtils.getNumberOrDefaultValue(this.printFormModel().rotation),
      mapCenter: {
        x: FormValueConversionUtils.getNumberOrDefaultValue(this.mapConfigState()?.center.x),
        y: FormValueConversionUtils.getNumberOrDefaultValue(this.mapConfigState()?.center.y),
      },
      activeBasemapId: FormValueConversionUtils.getStringOrDefaultValue(this.mapConfigState()?.activeBasemapId),
      activeMapItems: [...FormValueConversionUtils.getArrayOrDefaultValue(this.activeMapItems()), ...searchHighlightMapItems],
      drawings: [...FormValueConversionUtils.getArrayOrDefaultValue(this.drawings()), ...searchHighlightDrawings],
    };
  }
}
