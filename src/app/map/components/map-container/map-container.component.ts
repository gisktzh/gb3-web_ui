import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  effect,
  inject,
  input,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import {FeatureHighlightingService} from '../../services/feature-highlighting.service';
import {MapService} from '../../interfaces/map.service';
import {MAP_SERVICE} from '../../../app.tokens';
import {MapViewPadding} from '../../../shared/interfaces/map-view-padding.interface';
import {validateUploadedFileList} from 'src/app/shared/utils/validate-uploaded-file-list.utils';
import {ImportActions} from 'src/app/state/map/actions/import.actions';
import {Store} from '@ngrx/store';
import {FileValidationError} from 'src/app/shared/errors/file-upload.errors';

@Component({
  selector: 'map-container',
  templateUrl: './map-container.component.html',
  styleUrls: ['./map-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [FeatureHighlightingService],
})
export class MapContainerComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly mapService = inject<MapService>(MAP_SERVICE);
  private readonly featureHighlightingService = inject(FeatureHighlightingService);
  private readonly mainMapRef = viewChild.required<ElementRef>('mainMap');
  public readonly viewPadding = input<MapViewPadding | undefined>(undefined);
  private readonly store = inject(Store);

  constructor() {
    effect(() => this.mapService.setViewPadding(this.viewPadding()));
  }

  public ngOnInit() {
    this.featureHighlightingService.init();
  }

  public ngAfterViewInit() {
    // Ensure the initial padding is available before assigning the container creates the MapView.
    this.mapService.setViewPadding(this.viewPadding());
    this.mapService.assignMapElement(this.mainMapRef().nativeElement);
  }

  public ngOnDestroy() {
    this.mapService.deInit();
  }

  public handleDrop(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) {
      this.handleFileUpload(e.dataTransfer.files);
    }
  }

  private handleFileUpload(files: FileList) {
    try {
      validateUploadedFileList(files);
      this.store.dispatch(ImportActions.requestDrawingsImport({file: files[0]}));
    } catch (e) {
      this.store.dispatch(ImportActions.setFileValidationError({errorMessage: (e as FileValidationError).message}));
    }
  }

  protected handleDragOver(e: DragEvent) {
    e.stopPropagation();
    if (e.dataTransfer?.items.length) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  }

  protected handleDragLeave(e: DragEvent) {
    e.stopPropagation();
  }
}
