import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {LoadingState} from '../../../shared/types/loading-state';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {HasSavingState} from '../../../shared/interfaces/has-saving-state.interface';
import {
  selectPrintCreationLoadingState,
  selectPrintCreationResponse,
  selectPrintInfo,
  selectPrintInfoLoadingState
} from '../../../state/map/reducers/print.reducer';
import {PrintCreation, PrintCreationResponse, PrintInfo} from '../../../shared/interfaces/print.interface';
import {PrintActions} from '../../../state/map/actions/print.actions';
import {MapConfigState} from '../../../state/map/states/map-config.state';
import {selectMapConfigState} from '../../../state/map/reducers/map-config.reducer';

interface PrintForm {
  title: FormControl<string | null>;
  comment: FormControl<string | null>;
  layout: FormControl<string | null>;
  dpi: FormControl<number | null>;
  rotation: FormControl<number | null>;
  scale: FormControl<number | null>;
  outputFormat: FormControl<string | null>;
  showLegend: FormControl<boolean | null>;
  printActiveMapsSeparately: FormControl<boolean | null>;
}

@Component({
  selector: 'print-dialog',
  templateUrl: './print-dialog.component.html',
  styleUrls: ['./print-dialog.component.scss']
})
export class PrintDialogComponent implements OnInit, OnDestroy, HasSavingState {
  public readonly formGroup: FormGroup<PrintForm> = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.pattern(/[\S]/)]),
    comment: new FormControl(''),
    layout: new FormControl('', [Validators.required]),
    dpi: new FormControl(0, [Validators.required]),
    rotation: new FormControl(0, [Validators.min(-90), Validators.max(90)]),
    scale: new FormControl(0, [Validators.required]),
    outputFormat: new FormControl('', [Validators.required]),
    showLegend: new FormControl(false, [Validators.required]),
    printActiveMapsSeparately: new FormControl(false, [Validators.required])
  });

  public savingState: LoadingState = 'undefined';
  public printInfo?: PrintInfo;
  public printInfoLoadingState: LoadingState = 'undefined';
  public printCreationResponse?: PrintCreationResponse;
  public mapConfigState?: MapConfigState;

  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {
    this.formGroup.disable();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngOnInit() {
    this.initSubscriptions();
    this.store.dispatch(PrintActions.loadPrintInfo());
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.store
        .select(selectPrintInfoLoadingState)
        .pipe(
          tap((printInfoLoadingState) => {
            this.printInfoLoadingState = printInfoLoadingState;
            this.updateFormGroupState();
          })
        )
        .subscribe()
    );

    this.subscriptions.add(
      this.store
        .select(selectPrintInfo)
        .pipe(
          tap((printInfo) => {
            this.printInfo = printInfo;
            this.initializeDefaultFormValues(printInfo);
          })
        )
        .subscribe()
    );

    this.subscriptions.add(
      this.store
        .select(selectPrintCreationLoadingState)
        .pipe(
          tap((printCreationLoadingState) => {
            this.savingState = printCreationLoadingState;
            this.updateFormGroupState();
          })
        )
        .subscribe()
    );

    this.subscriptions.add(
      this.store
        .select(selectPrintCreationResponse)
        .pipe(
          tap((printCreationResponse) => {
            this.printCreationResponse = printCreationResponse;
          })
        )
        .subscribe()
    );

    this.subscriptions.add(
      this.store
        .select(selectMapConfigState)
        .pipe(
          tap((mapConfigState) => {
            this.mapConfigState = mapConfigState;
          })
        )
        .subscribe()
    );
  }

  private updateFormGroupState() {
    if (this.printInfoLoadingState !== 'loaded' || this.savingState === 'loading') {
      this.formGroup.disable();
    } else {
      this.formGroup.enable();
      // TODO WES: remove the following two
      this.formGroup.controls.showLegend.disable();
      this.formGroup.controls.printActiveMapsSeparately.disable();
    }
  }

  private initializeDefaultFormValues(printInfo: PrintInfo | undefined) {
    const defaultLayout = printInfo?.layouts[0];
    this.formGroup.setValue({
      title: '',
      comment: '',
      layout: defaultLayout?.name ?? '',
      dpi: printInfo?.dpis[0]?.value ?? 0,
      rotation: defaultLayout?.rotation ? 0 : null,
      scale: printInfo?.scales[0]?.value ?? 0,
      outputFormat: printInfo?.outputFormats[0]?.name ?? '',
      showLegend: false,
      printActiveMapsSeparately: false
    });
  }

  public close() {
    this.store.dispatch(PrintActions.setPrintDialogVisible({printDialogVisible: false}));
  }

  public print() {
    if (!this.formGroup.valid) {
      return;
    }

    // TODO WES: remove all the default values from this and replace them using the current active map items / map state / and so on
    const value = this.formGroup.value;
    const printCreation: PrintCreation = {
      units: 'm',
      dpi: value.dpi ?? 0,
      layout: value.layout ?? '',
      outputFormat: value.outputFormat ?? '',
      srs: 'EPSG:2056',
      layers: [
        {
          layers: ['wald', 'seen'],
          customParams: {
            dpi: 96,
            transparent: true,
            format: 'image/png; mode=8bit'
          },
          format: 'image/png; mode=8bit',
          baseURL: 'https://maps.zh.ch/wms/BASISKARTEZH',
          opacity: 1,
          singleTile: true,
          styles: [''],
          type: 'WMS'
        }
      ],
      pages: [
        {
          scale: value.scale ?? 0,
          withLegend: value.showLegend ? 1 : 0,
          userTitle: value.title ?? '',
          userComment: value.comment ?? '',
          topicTitle: 'Landeskarten, Übersichtsplan',
          headerImg: 'http://127.0.0.1/images/LogoGIS.jpg',
          center: [this.mapConfigState?.center.x ?? 0, this.mapConfigState?.center.y ?? 0],
          extent: [2663148, 1215246, 2721851, 1289753],
          rotation: value.rotation ?? 0,
          topic: 'BASISKARTEZH'
        }
      ]
    };
    this.store.dispatch(PrintActions.requestPrintCreation({printCreation}));
  }
}
