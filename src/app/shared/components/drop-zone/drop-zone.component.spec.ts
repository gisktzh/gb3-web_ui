import {ComponentFixture, TestBed} from '@angular/core/testing';
import {FileUploadRestrictionsConfig} from '../../configs/file-upload-restrictions.config';
import {DropZoneComponent} from './drop-zone.component';

describe('DropZoneComponent', () => {
  let component: DropZoneComponent;
  let fixture: ComponentFixture<DropZoneComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [DropZoneComponent]}).compileComponents();

    fixture = TestBed.createComponent(DropZoneComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('advertises exactly the file types accepted by validation', () => {
    const input = element.querySelector<HTMLInputElement>('input[type="file"]');

    expect(input?.getAttribute('accept')).toBe(FileUploadRestrictionsConfig.allowedFileTypes.join(', '));
  });

  it('marks a valid drag target as active and requests copy semantics', () => {
    const dropZone = element.querySelector<HTMLElement>('.drop-zone')!;
    const dragOver = new DragEvent('dragover', {bubbles: true, cancelable: true});
    const dataTransfer = {items: [{}], dropEffect: 'none'};
    Object.defineProperty(dragOver, 'dataTransfer', {value: dataTransfer});

    dropZone.dispatchEvent(dragOver);
    fixture.detectChanges();

    expect(dragOver.defaultPrevented).toBe(true);
    expect(dataTransfer.dropEffect).toBe('copy');
    expect(dropZone.classList).toContain('drop-zone--hovered');
    expect(element.querySelector<HTMLButtonElement>('.drop-zone__button')?.disabled).toBe(true);
  });

  it('removes the active drag state when the pointer leaves', () => {
    const dropZone = element.querySelector<HTMLElement>('.drop-zone')!;
    const dragOver = new DragEvent('dragover', {bubbles: true});
    Object.defineProperty(dragOver, 'dataTransfer', {value: {items: [{}], dropEffect: 'none'}});
    dropZone.dispatchEvent(dragOver);

    dropZone.dispatchEvent(new DragEvent('dragleave', {bubbles: true}));
    fixture.detectChanges();

    expect(dropZone.classList).not.toContain('drop-zone--hovered');
  });

  it('emits a valid file selected through the native input', () => {
    const addedFile = vi.spyOn(component.addedFileEvent, 'emit');
    const file = new File(['{}'], 'map.geojson', {type: 'application/geo+json'});
    const input = element.querySelector<HTMLInputElement>('input[type="file"]')!;
    Object.defineProperty(input, 'files', {value: fileList(file)});

    input.dispatchEvent(new Event('change', {bubbles: true}));

    expect(addedFile).toHaveBeenCalledExactlyOnceWith(file);
  });

  it('emits a valid dropped file', () => {
    const addedFile = vi.spyOn(component.addedFileEvent, 'emit');
    const file = new File(['<kml />'], 'map.kml', {type: 'application/vnd.google-earth.kml+xml'});
    const drop = new DragEvent('drop', {bubbles: true, cancelable: true});
    Object.defineProperty(drop, 'dataTransfer', {value: {files: fileList(file)}});

    element.querySelector('.drop-zone')?.dispatchEvent(drop);

    expect(drop.defaultPrevented).toBe(true);
    expect(addedFile).toHaveBeenCalledExactlyOnceWith(file);
  });

  it('reports invalid files and leaves the drop target inactive', () => {
    const uploadError = vi.spyOn(component.uploadErrorEvent, 'emit');
    const input = element.querySelector<HTMLInputElement>('input[type="file"]')!;
    Object.defineProperty(input, 'files', {value: fileList(new File(['binary'], 'malware.exe'))});

    input.dispatchEvent(new Event('change', {bubbles: true}));
    fixture.detectChanges();

    expect(uploadError).toHaveBeenCalledOnce();
    expect(uploadError.mock.calls[0][0]).toBeTruthy();
    expect(element.querySelector('.drop-zone')?.classList).not.toContain('drop-zone--hovered');
  });

  it('opens the native file picker from the visible button', () => {
    const input = element.querySelector<HTMLInputElement>('input[type="file"]')!;
    const click = vi.spyOn(input, 'click');

    element.querySelector<HTMLButtonElement>('.drop-zone__button')?.click();

    expect(click).toHaveBeenCalledOnce();
  });
});

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
