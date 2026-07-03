import { CanActivateFn } from "@angular/router";
import { inject } from "@angular/core";
import { environment } from "../../../environments/environment";
import { MsalGuard } from "@azure/msal-angular";

export const authGuard: CanActivateFn = (route, state) => {
  if (environment.dev_mode) return true;

  const msal_guard = inject(MsalGuard);
  return msal_guard.canActivate(route, state);
};
