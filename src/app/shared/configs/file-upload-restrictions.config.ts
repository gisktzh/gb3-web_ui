import Restrictions from '@uppy/core/lib/Restricter';

export const FileUploadRestrictionsConfig: Partial<Restrictions.Restrictions> = {
  maxNumberOfFiles: 1,
  maxFileSize: 10_000_000, // 10MB
  allowedFileTypes: ['.kml', '.json', '.geojson'],
};
