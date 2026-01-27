import {FileSizeTooLargeValidationError, InvalidFileTypeValidationError, TooManyFilesValidationError} from '../errors/file-upload.errors';
import {validateUploadedFileList} from './validate-uploaded-file-list.utils';

class MutableFileList extends Array implements FileList {
  constructor(initialFiles: Iterable<File> = []) {
    super();
    for (const file of initialFiles) {
      this.push(file);
    }
  }

  public item(index: number): File | null {
    return this[index] ?? null;
  }
}

class MutableFile extends File {
  private fileName!: string;
  private fileSize!: number;

  constructor(fileName: string, fileSize: number) {
    super([], fileName, {});
    this.fileName = fileName;
    this.fileSize = fileSize;
  }

  public override get name() {
    return this.fileName;
  }

  public override get size() {
    return this.fileSize;
  }
}

describe('validateUploadedFileList', () => {
  it('should throw an appropriate error if the file list is empty', () => {
    const list = new MutableFileList();

    expect(() => validateUploadedFileList(list)).toThrow(new TooManyFilesValidationError());
  });

  it('should throw an appropriate error if the file list has more than 1 file', () => {
    const list = new MutableFileList([new MutableFile('hello.txt', 1), new MutableFile('world.txt', 1)]);

    expect(() => validateUploadedFileList(list)).toThrow(new TooManyFilesValidationError());
  });

  it('should not throw an error if exactly 1 file is passed', () => {
    const list = new MutableFileList([new MutableFile('hello.txt', 1)]);

    expect(() => validateUploadedFileList(list)).not.toThrow(new TooManyFilesValidationError());
  });

  it('should throw an appropriate exception if some non-allowed file ending is given', () => {
    const list = new MutableFileList([new MutableFile('hello.txt', 1)]);

    expect(() => validateUploadedFileList(list)).toThrow(new InvalidFileTypeValidationError());
  });

  it('should not throw an exception if an allowed file ending is given', () => {
    const listJson = new MutableFileList([new MutableFile('hello.json', 1)]);
    expect(() => validateUploadedFileList(listJson)).not.toThrow(new InvalidFileTypeValidationError());

    const listGeojson = new MutableFileList([new MutableFile('hello.geojson', 1)]);
    expect(() => validateUploadedFileList(listGeojson)).not.toThrow(new InvalidFileTypeValidationError());

    const listKml = new MutableFileList([new MutableFile('hello.kml', 1)]);
    expect(() => validateUploadedFileList(listKml)).not.toThrow(new InvalidFileTypeValidationError());
  });

  it('should throw an appropriate exception if the file size exceeds a given maximum', () => {
    const list = new MutableFileList([new MutableFile('hello.json', Infinity)]);

    expect(() => validateUploadedFileList(list)).toThrow(new FileSizeTooLargeValidationError());
  });
});
