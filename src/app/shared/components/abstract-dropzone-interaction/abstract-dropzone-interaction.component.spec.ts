import {ChangeDetectionStrategy, Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {describe, expect, it, vi} from 'vitest';

import {AbstractDropzoneInteractionComponent} from './abstract-dropzone-interaction.component';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  template: '',
})
class TestDropzoneComponent extends AbstractDropzoneInteractionComponent {
  public handleFileUpload = vi.fn();
}

describe('AbstractDropzoneInteractionComponent', () => {
  let component: TestDropzoneComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestDropzoneComponent],
    });

    component = TestBed.createComponent(TestDropzoneComponent).componentInstance;
  });

  describe('handleDragOver', () => {
    it('should stop propagation and set isHovered to true', () => {
      const event = dragEvent('dragover');
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

      component.handleDragOver(event);

      expect(stopPropagationSpy).toHaveBeenCalledOnce();
      expect(component.isHovered()).toBe(true);
    });

    it('should prevent default and set dropEffect to copy when dataTransfer contains items', () => {
      const dataTransfer = dataTransferWithItems(1);
      const event = dragEvent('dragover', dataTransfer);
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      component.handleDragOver(event);

      expect(preventDefaultSpy).toHaveBeenCalledOnce();
      expect(dataTransfer.dropEffect).toBe('copy');
    });

    it('should not prevent default when dataTransfer contains no items', () => {
      const dataTransfer = dataTransferWithItems(0);
      const event = dragEvent('dragover', dataTransfer);
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      component.handleDragOver(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
      expect(component.isHovered()).toBe(true);
    });

    it('should not prevent default when dataTransfer is missing', () => {
      const event = dragEvent('dragover');
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      component.handleDragOver(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
      expect(component.isHovered()).toBe(true);
    });
  });

  describe('handleDragLeave', () => {
    it('should stop propagation and set isHovered to false', () => {
      component.isHovered.set(true);
      const event = dragEvent('dragleave');
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

      component.handleDragLeave(event);

      expect(stopPropagationSpy).toHaveBeenCalledOnce();
      expect(component.isHovered()).toBe(false);
    });
  });

  describe('handleDrop', () => {
    it('should prevent default and set isHovered to false', () => {
      component.isHovered.set(true);
      const event = dragEvent('drop');
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      component.handleDrop(event);

      expect(preventDefaultSpy).toHaveBeenCalledOnce();
      expect(component.isHovered()).toBe(false);
    });

    it('should upload files when dataTransfer is available', () => {
      const file = new File(['content'], 'test.txt');
      const files = fileList(file);
      const dataTransfer = dataTransferWithFiles(files);
      const event = dragEvent('drop', dataTransfer);

      component.handleDrop(event);

      expect(component.handleFileUpload).toHaveBeenCalledOnce();
      expect(component.handleFileUpload).toHaveBeenCalledWith(files);
    });

    it('should not upload files when dataTransfer is missing', () => {
      const event = dragEvent('drop');

      component.handleDrop(event);

      expect(component.handleFileUpload).not.toHaveBeenCalled();
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
