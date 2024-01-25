export interface AuthStatusState {
  isInitialDataLoaded: boolean;
  isAuthenticated: boolean;
  userName: string | undefined;
  accessToken: string | undefined;
}
