export interface AuthStatusState {
  isAuthenticationInitialized: boolean;
  isAuthenticated: boolean;
  userName: string | undefined;
  userEmail: string | undefined;
}
