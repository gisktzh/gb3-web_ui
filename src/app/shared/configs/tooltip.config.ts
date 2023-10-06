import {MatTooltipDefaultOptions} from '@angular/material/tooltip';
import {ConfigService} from '../services/config.service';

export const toolTipLongDelay: MatTooltipDefaultOptions = {
  showDelay: 1000,
  hideDelay: 0,
  touchendHideDelay: 1500,
  position: 'below',
};

export const toolTipMapToolsAndControls: MatTooltipDefaultOptions = {
  showDelay: 0,
  hideDelay: 0,
  touchendHideDelay: 1500,
  position: 'left',
};

export function toolTipFactoryLongDelay(configService: ConfigService): MatTooltipDefaultOptions {
  return configService.tooltipConfig.longDelay;
}

export function toolTipFactoryMapToolsAndControls(configService: ConfigService): MatTooltipDefaultOptions {
  return configService.tooltipConfig.mapToolsAndControls;
}
