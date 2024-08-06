import {Restrictions} from '@uppy/core';

export const FileUploadRestrictionsConfig: Restrictions = {
  maxNumberOfFiles: 1,
  maxFileSize: 10000000, // 10MB
  allowedFileTypes: ['.kml', '.json', '.geojson'],
};
