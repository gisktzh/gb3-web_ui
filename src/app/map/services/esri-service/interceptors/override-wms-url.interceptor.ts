import RequestInterceptor = __esri.RequestInterceptor;
import AfterInterceptorCallback = __esri.AfterInterceptorCallback;
import RequestResponse = __esri.RequestResponse;
import {environment} from '../../../../../environments/environment';

/**
 * WMS URL that is hardcoded in the ZH WMS mapfiles
 */
const hardcodedWmsUrl = /http:\/\/wms\.zh\.ch/g;

/**
 * Replaces any mention of hard-coded WMS Urls in the GetCapabilities response with another Url to prevent Esri from always loading the same
 * WMS. This is required because the GetCapabilities request goes to e.g. https://maps.zh.ch, while all the WMS layers are hard-coded to
 * http://wms.zh.ch. Esri Javascript API will then always use the Url from the GetCapabilities request.
 *
 * This is only an issue for those environments that use the above GetCapabilities request, but should not serve the layers from there (i.e.
 * local envs).
 *
 * @param response
 */
const changeWmsUrlInCapabilitiesCallback: AfterInterceptorCallback = (response: RequestResponse) => {
  const overrideWmsUrl = environment.baseUrls.overrideWmsUrl;

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

/**
 * This factory returns an interceptor that
 * * adds an access token to all requests as needed
 * * adds an override function if needed
 *
 * @param hasWmsOverride
 * @param accessToken
 */
const wmsAuthAndUrlOverrideInterceptorFactory = (hasWmsOverride?: string, accessToken?: string): __esri.RequestInterceptor => {
  const baseInterceptor: RequestInterceptor = {
    headers: {},
    urls: [environment.baseUrls.gb2Api, environment.baseUrls.gb2Wms],
    after: changeWmsUrlInCapabilitiesCallback
  };

  if (!hasWmsOverride) {
    delete baseInterceptor.after;
  }

  if (accessToken) {
    baseInterceptor.headers.Authorization = `Bearer ${accessToken}`;
  }

  return baseInterceptor;
};

export default wmsAuthAndUrlOverrideInterceptorFactory;
