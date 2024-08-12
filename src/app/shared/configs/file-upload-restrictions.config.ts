import {Restrictions} from '@uppy/core';

export const FileUploadRestrictionsConfig: Restrictions = {
  maxNumberOfFiles: 1,
  maxFileSize: 10_000_000, // 10MB
  allowedFileTypes: ['.kml', '.json', '.geojson'],
};
