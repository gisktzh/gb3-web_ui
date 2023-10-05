import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {LoadingState} from '../../../../shared/types/loading-state.type';
import {Store} from '@ngrx/store';
import {BehaviorSubject, combineLatestWith, distinctUntilChanged, filter, Subscription, take, tap} from 'rxjs';
import {selectCapabilities, selectCapabilitiesLoadingState, selectCreationLoadingState} from '../../../../state/map/reducers/print.reducer';
import {PrintCapabilities, PrintCreation, PrintMapItem, ReportOrientation} from '../../../../shared/interfaces/print.interface';
import {PrintActions} from '../../../../state/map/actions/print.actions';
import {MapConfigState} from '../../../../state/map/states/map-config.state';
import {selectMapConfigState} from '../../../../state/map/reducers/map-config.reducer';
import {ActiveMapItem} from '../../../models/active-map-item.model';
import {selectItems} from '../../../../state/map/reducers/active-map-item.reducer';
import {BasemapConfigService} from '../../../services/basemap-config.service';
import {MapUiActions} from '../../../../state/map/actions/map-ui.actions';
import {map} from 'rxjs/operators';
import {ConfigService} from '../../../../shared/services/config.service';
import {UserDrawingLayer} from '../../../../shared/enums/drawing-layer.enum';
import {InternalDrawingRepresentation} from '../../../../shared/interfaces/internal-drawing-representation.interface';
import {selectDrawings} from '../../../../state/map/reducers/drawing.reducer';

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

  private readonly isFormInitialized: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private readonly subscriptions: Subscription = new Subscription();
  private drawings: InternalDrawingRepresentation[] = [];

  constructor(
    private readonly store: Store,
    private readonly basemapConfigService: BasemapConfigService,
    private readonly configService: ConfigService,
  ) {
    // disable the form until the print capabilities from the print API returns; otherwise the form is not complete.
    this.formGroup.disable();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.store.dispatch(PrintActions.removePrintPreview());
  }

  public ngOnInit() {
    this.initSubscriptions();
  }

  public print() {
    if (!this.formGroup.valid || this.printCreationLoadingState === 'loading') {
      return;
    }

    const printCreation = this.createPrintCreation();
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
          tap(([value, _]) => {
            this.updateFormGroupControlsState();
          }),
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
          tap((value) => {
            this.updatePrintPreview(value.reportLayout, value.reportOrientation, value.scale, value.rotation);
          }),
        )
        .subscribe(),
    );

    // initialize the form (once)
    this.subscriptions.add(
      this.store
        .select(selectCapabilities)
        .pipe(
          combineLatestWith(this.store.select(selectMapConfigState)),
          filter(([printCapabilities, _]) => printCapabilities !== undefined),
          take(1),
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

    // TODO (GB3-440) - remove the following line as soon as the legends gets printed
    this.formGroup.controls.showLegend.disable({emitEvent});
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

  private createPrintCreation(): PrintCreation {
    const value = this.formGroup.value;
    return {
      format: value.format ?? '',
      reportLayout: value.reportLayout ?? '',
      reportOrientation: value.reportOrientation ?? undefined,
      attributes: {
        reportTitle: this.activeMapItems
          ? this.activeMapItems
              .filter((activeMapItem) => activeMapItem.visible)
              .map((activeMapItem) => activeMapItem.title)
              .join(', ')
          : '',
        userTitle: value.title ?? '',
        userComment: value.comment ?? '',
        showLegend: value.showLegend ?? false,
      },
      map: {
        scale: value.scale ?? 0,
        dpi: value.dpi ?? 0,
        center: [this.mapConfigState?.center.x ?? 0, this.mapConfigState?.center.y ?? 0],
        rotation: value.rotation ?? 0,
        mapItems: this.createPrintCreationMapItems(),
      },
    };
  }

  private createPrintCreationMapItems(): PrintMapItem[] {
    // order matters: the lowest index has the highest visibility
    const mapItems: PrintMapItem[] = [];

    // add all active map items
    if (this.activeMapItems) {
      this.activeMapItems
        .filter((activeMapItem) => activeMapItem.visible)
        .forEach((activeMapItem) => {
          switch (activeMapItem.settings.type) {
            case 'drawing':
              mapItems.push(this.printDrawingLayer(activeMapItem.settings.userDrawingLayer));
              break;
            case 'gb2Wms':
              mapItems.push({
                layers: activeMapItem.settings.layers.filter((layer) => layer.visible).map((layer) => layer.layer),
                type: 'WMS',
                opacity: activeMapItem.opacity,
                url: activeMapItem.settings.url,
                mapTitle: activeMapItem.title,
                customParams: {
                  format: this.configService.gb2Config.wmsFormatMimeType,
                  transparent: true, // always true
                },
              });
              break;
          }
        });
    }

    // add basemap
    const activeBasemapId = this.mapConfigState?.activeBasemapId;
    const activeBasemap = this.basemapConfigService.availableBasemaps.find((basemap) => basemap.id === activeBasemapId);
    if (activeBasemap) {
      switch (activeBasemap.type) {
        case 'blank':
          // a blank basemap does not have to be printed
          break;
        case 'wms':
          mapItems.push({
            layers: activeBasemap.layers.map((layer) => layer.name),
            type: 'WMS',
            opacity: 1,
            url: activeBasemap.url,
            mapTitle: activeBasemap.title,
            background: true,
          });
          break;
      }
    }

    // reverse the order as the print API uses an inverse positioning to draw them (lowest index has lowest visibility)
    return mapItems.reverse();
  }

  //todo: GB3-604/GB3-606 (requires mapping of properties)
  private printDrawingLayer(source: UserDrawingLayer): PrintMapItem {
    const drawingsToDraw = this.drawings.filter((d) => d.source === source);

    return {
      type: 'Vector',
      geojson: {
        type: 'FeatureCollection',
        features: drawingsToDraw.map((d) => ({
          type: d.type,
          geometry: d.geometry,
          properties: {style: 'DEFAULTSTYLE', labelText: d.labelText ?? ''},
        })),
      },
      styles: {
        DEFAULTSTYLE: {
          pointRadius: 3,
          fillColor: '#ff0000',
          fillOpacity: 0.4,
          strokeColor: '#ff0000',
          strokeWidth: 2,
          label: '[labelText]',
          fontSize: '8px',
          fontColor: '#ff0000',
          fontFamily: 'Arial,Helvetica,sans-serif',
          fontWeight: 'normal',
          labelOutlineColor: '#ffffff',
          labelOutlineWidth: 2,
          labelAlign: 'ct',
          labelYOffset: 15,
        },
      },
    };
  }
}
