import {Restrictions} from '@uppy/core/lib/Restricter';

export const FileUploadRestrictionsConfig: Restrictions = {
  maxNumberOfFiles: 1,
  maxFileSize: 10000000, // 10MB
  allowedFileTypes: ['.kml', '.json', '.geojson'],
  minFileSize: 0,
  requiredMetaFields: [],
  minNumberOfFiles: 0,
  maxTotalFileSize: 10000000, // 10MB
};
