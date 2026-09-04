import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Mock} from 'vitest';
import {DropZoneComponent} from './drop-zone.component';

describe('DropZoneComponent', () => {
  let component: DropZoneComponent;
  let fixture: ComponentFixture<DropZoneComponent>;
  let compiled: HTMLElement;

  let addedFileEventSpy: Mock;
  let uploadErrorEventSpy: Mock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropZoneComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(DropZoneComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    addedFileEventSpy = vi.spyOn(component.addedFileEvent, 'emit');
    uploadErrorEventSpy = vi.spyOn(component.uploadErrorEvent, 'emit');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render accepted file types on input', () => {
    const input = compiled.querySelector<HTMLInputElement>('input[type="file"]');

    expect(input).toBeTruthy();
    expect(input?.getAttribute('accept')).toBe(component.acceptedFileTypes);
  });

  it('should set hovered state on drag over with transferable items', () => {
    const dropZone = compiled.querySelector<HTMLElement>('.drop-zone');

    const event = new DragEvent('dragover', {
      bubbles: true,
    });

    Object.defineProperty(event, 'dataTransfer', {
      value: {
        items: [{}],
        dropEffect: '',
      },
    });

    dropZone?.dispatchEvent(event);
    fixture.detectChanges();

    expect(dropZone?.classList).toContain('drop-zone--hovered');
  });

  it('should remove hovered state on drag leave', () => {
    const dropZone = compiled.querySelector<HTMLElement>('.drop-zone');

    const dragOverEvent = new DragEvent('dragover', {
      bubbles: true,
    });

    Object.defineProperty(dragOverEvent, 'dataTransfer', {
      value: {
        items: [{}],
        dropEffect: '',
      },
    });

    dropZone?.dispatchEvent(dragOverEvent);
    fixture.detectChanges();

    expect(dropZone?.classList).toContain('drop-zone--hovered');

    dropZone?.dispatchEvent(
      new DragEvent('dragleave', {
        bubbles: true,
      }),
    );

    fixture.detectChanges();

    expect(dropZone?.classList).not.toContain('drop-zone--hovered');
  });

  it('should disable button while hovered', () => {
    const dropZone = compiled.querySelector<HTMLElement>('.drop-zone');

    const button = compiled.querySelector<HTMLButtonElement>('.drop-zone__button');

    const event = new DragEvent('dragover', {
      bubbles: true,
    });

    Object.defineProperty(event, 'dataTransfer', {
      value: {
        items: [{}],
        dropEffect: '',
      },
    });

    dropZone?.dispatchEvent(event);
    fixture.detectChanges();

    expect(button?.disabled).toBe(true);
  });

  it('should call file input click when button is clicked', () => {
    const input = compiled.querySelector<HTMLInputElement>('input[type="file"]');

    const clickSpy = vi.spyOn(input!, 'click');

    const button = compiled.querySelector<HTMLButtonElement>('.drop-zone__button');

    button?.click();

    expect(clickSpy).toHaveBeenCalled();
  });

  it('should emit addedFileEvent when a valid dropped file is provided', () => {
    const file = new File(['content'], 'test.kml', {
      type: 'application/vnd.google-earth.kml+xml',
    });

    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => (index === 0 ? file : null),
    } as Partial<FileList>;

    const dropZone = compiled.querySelector<HTMLElement>('.drop-zone');

    const event = new DragEvent('drop', {
      bubbles: true,
    });

    Object.defineProperty(event, 'dataTransfer', {
      value: {
        files: fileList,
      },
    });

    dropZone?.dispatchEvent(event);
    fixture.detectChanges();

    expect(addedFileEventSpy).toHaveBeenCalledWith(file);
  });

  it('should handle file input changes', () => {
    const file = new File(['content'], 'test.json', {
      type: 'application/json',
    });

    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => (index === 0 ? file : null),
    } as Partial<FileList>;

    const input = compiled.querySelector<HTMLInputElement>('input[type="file"]');

    Object.defineProperty(input, 'files', {
      value: fileList,
    });

    input?.dispatchEvent(
      new Event('change', {
        bubbles: true,
      }),
    );

    fixture.detectChanges();

    expect(addedFileEventSpy).toHaveBeenCalledWith(file);
  });

  it('should emit uploadErrorEvent when file validation fails', () => {
    const file = new File(['content'], 'invalid.exe', {
      type: 'application/octet-stream',
    });

    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => (index === 0 ? file : null),
    } as Partial<FileList>;

    const input = compiled.querySelector<HTMLInputElement>('input[type="file"]');

    Object.defineProperty(input, 'files', {
      value: fileList,
    });

    input?.dispatchEvent(
      new Event('change', {
        bubbles: true,
      }),
    );

    fixture.detectChanges();

    expect(uploadErrorEventSpy).toHaveBeenCalled();
  });
});
