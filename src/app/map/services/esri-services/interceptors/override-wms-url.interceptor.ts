import RequestInterceptor = __esri.RequestInterceptor;
import AfterInterceptorCallback = __esri.AfterInterceptorCallback;
import RequestResponse = __esri.RequestResponse;

/**
 * WMS URL that is hardcoded in the ZH WMS mapfiles. It can be either prefixed
 * with "web." if it is an intranet environment, or without; so the following * group captures both.
 */
const hardcodedWmsUrl = /http:\/\/(web\.)?wms\.zh\.ch/g;

/**
 * Factory for the interceptor callback:
 *
 * Replaces any mention of hard-coded WMS Urls in the GetCapabilities response with another Url to prevent Esri from always loading the same
 * WMS. This is required because the GetCapabilities request goes to e.g. https://maps.zh.ch, while all the WMS layers are hard-coded to
 * http://wms.zh.ch. Esri Javascript API will then always use the Url from the GetCapabilities request.
 *
 * This is only an issue for those environments that use the above GetCapabilities request, but should not serve the layers from there (i.e.
 * local envs).
 */
const callbackFactory: (overrideWmsUrl: string) => AfterInterceptorCallback = (overrideWmsUrl: string) => {
  return (response: RequestResponse) => {
    if (overrideWmsUrl && response.requestOptions?.query.REQUEST === 'GetCapabilities') {
      try {
        /**
         * As per the docs (https://developers.arcgis.com/javascript/latest/api-reference/esri-request.html#RequestResponse), the response
         * might have one of many types. Empirically tested (™), it has been determined that GetCapabilities returns a document; so the
         * following approach works well for that. If the response type changes at some point, this needs to be investigated.
         */
        const {data} = response;
        const dataString = new XMLSerializer().serializeToString(data);
        const adjustedString = dataString.replace(hardcodedWmsUrl, overrideWmsUrl);
        response.data = new DOMParser().parseFromString(adjustedString, 'text/xml');
      } catch (e) {
        // in the case of any issues, continue. This will lead to an error in the map not being loaded, but at least we did not corrupt the
        // whole app in a place that cannot be communicated to the user.
        // todo: add logging?
      }
    }
  };
};

/**
 * This factory returns an interceptor that
 * * adds an access token to all requests as needed
 * * adds an override function if needed
 *
 * @param urlsToListenTo
 * @param hasWmsOverride
 * @param accessToken
 */
const wmsAuthAndUrlOverrideInterceptorFactory = (
  urlsToListenTo: string[],
  hasWmsOverride?: string,
  accessToken?: string,
): __esri.RequestInterceptor => {
  const baseInterceptor: RequestInterceptor = {
    headers: {},
    urls: urlsToListenTo,
    after: hasWmsOverride ? callbackFactory(hasWmsOverride) : undefined,
  };

  if (accessToken) {
    baseInterceptor.headers.Authorization = `Bearer ${accessToken}`;
  }

  return baseInterceptor;
};

export default wmsAuthAndUrlOverrideInterceptorFactory;
