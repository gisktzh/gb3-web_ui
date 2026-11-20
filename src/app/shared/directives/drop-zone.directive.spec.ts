import {ChangeDetectionStrategy, Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {describe, expect, it, vi} from 'vitest';

import {DropZoneDirective} from './drop-zone.directive';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DropZoneDirective],
  template: '<div dropZone (fileUploaded)="handleFileUploaded($event)" (hoverStateChange)="handleHoverStateChange($event)"></div>',
})
class TestHostComponent {
  public handleFileUploaded = vi.fn();
  public handleHoverStateChange = vi.fn();
}

describe('DropZoneDirective', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<TestHostComponent>>;
  let directive: DropZoneDirective;
  let hostElement: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    directive = fixture.debugElement.children[0].injector.get(DropZoneDirective);
    hostElement = fixture.nativeElement.querySelector('[dropZone]');

    fixture.detectChanges();
  });

  describe('handleDragOver', () => {
    it('should stop propagation and emit hoverStateChange', () => {
      const event = dragEvent('dragover');
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

      directive.handleDragOver(event);

      expect(stopPropagationSpy).toHaveBeenCalledOnce();
      expect(fixture.componentInstance.handleHoverStateChange).toHaveBeenCalledWith(true);
    });

    it('should prevent default and set dropEffect to copy when dataTransfer contains items', () => {
      const dataTransfer = dataTransferWithItems(1);
      const event = dragEvent('dragover', dataTransfer);
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      directive.handleDragOver(event);

      expect(preventDefaultSpy).toHaveBeenCalledOnce();
      expect(dataTransfer.dropEffect).toBe('copy');
    });

    it('should not prevent default when dataTransfer contains no items', () => {
      const dataTransfer = dataTransferWithItems(0);
      const event = dragEvent('dragover', dataTransfer);
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      directive.handleDragOver(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
      expect(fixture.componentInstance.handleHoverStateChange).toHaveBeenCalledWith(true);
    });

    it('should not prevent default when dataTransfer is missing', () => {
      const event = dragEvent('dragover');
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      directive.handleDragOver(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
      expect(fixture.componentInstance.handleHoverStateChange).toHaveBeenCalledWith(true);
    });
  });

  describe('handleDragLeave', () => {
    it('should stop propagation and emit hoverStateChange false', () => {
      const event = dragEvent('dragleave');
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

      directive.handleDragLeave(event);

      expect(stopPropagationSpy).toHaveBeenCalledOnce();
      expect(fixture.componentInstance.handleHoverStateChange).toHaveBeenCalledWith(false);
    });
  });

  describe('handleDrop', () => {
    it('should prevent default and emit hoverStateChange false', () => {
      const event = dragEvent('drop');
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      directive.handleDrop(event);

      expect(preventDefaultSpy).toHaveBeenCalledOnce();
      expect(fixture.componentInstance.handleHoverStateChange).toHaveBeenCalledWith(false);
    });

    it('should emit uploaded files when dataTransfer is available', () => {
      const files = fileList(new File(['content'], 'test.txt'));
      const dataTransfer = dataTransferWithFiles(files);
      const event = dragEvent('drop', dataTransfer);

      directive.handleDrop(event);

      expect(fixture.componentInstance.handleFileUploaded).toHaveBeenCalledOnce();
      expect(fixture.componentInstance.handleFileUploaded).toHaveBeenCalledWith(files);
    });

    it('should not emit uploaded files when dataTransfer is missing', () => {
      const event = dragEvent('drop');

      directive.handleDrop(event);

      expect(fixture.componentInstance.handleFileUploaded).not.toHaveBeenCalled();
    });
  });

  describe('host listeners', () => {
    it('should invoke handleDragOver when dragover occurs on the host element', () => {
      const dataTransfer = dataTransferWithItems(1);
      const event = dragEvent('dragover', dataTransfer);
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      hostElement.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalledOnce();
      expect(dataTransfer.dropEffect).toBe('copy');
      expect(fixture.componentInstance.handleHoverStateChange).toHaveBeenCalledWith(true);
    });

    it('should invoke handleDragLeave when dragleave occurs on the host element', () => {
      const event = dragEvent('dragleave');

      hostElement.dispatchEvent(event);

      expect(fixture.componentInstance.handleHoverStateChange).toHaveBeenCalledWith(false);
    });

    it('should invoke handleDrop when drop occurs on the host element', () => {
      const files = fileList(new File(['content'], 'test.txt'));
      const event = dragEvent('drop', dataTransferWithFiles(files));

      hostElement.dispatchEvent(event);

      expect(fixture.componentInstance.handleHoverStateChange).toHaveBeenCalledWith(false);
      expect(fixture.componentInstance.handleFileUploaded).toHaveBeenCalledWith(files);
    });
  });
});

function dragEvent(type: string, dataTransfer?: DataTransfer): DragEvent {
  const event = new Event(type, {bubbles: true, cancelable: true});

  Object.defineProperty(event, 'dataTransfer', {
    value: dataTransfer,
  });

  return event as DragEvent;
}

function dataTransferWithItems(length: number): DataTransfer {
  const dataTransfer = new DataTransfer();

  Object.defineProperty(dataTransfer, 'items', {
    value: {length},
  });

  return dataTransfer;
}

function dataTransferWithFiles(files: FileList): DataTransfer {
  const dataTransfer = new DataTransfer();

  Object.defineProperty(dataTransfer, 'files', {
    value: files,
  });

  return dataTransfer;
}

function fileList(file: File): FileList {
  return {
    0: file,
    length: 1,
    item: (index: number) => (index === 0 ? file : null),
    *[Symbol.iterator]() {
      yield file;
    },
  } as FileList;
}
