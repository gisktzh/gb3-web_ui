import {RuntimeConfig} from '../interfaces/runtime-config.interface';
import {localRuntimeConfig} from './runtime-configs/local-runtime-config';
import {remoteDeployments} from './runtime-configs/remote-deployments';

export const defaultRuntimeConfig: RuntimeConfig[] = [localRuntimeConfig, ...remoteDeployments];
