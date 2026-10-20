import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { MsalService } from "@azure/msal-angular";

import { environment } from "../../../environments/environment";
import { catchError, EMPTY, from, switchMap, throwError } from 'rxjs';
import { CacheLookupPolicy, InteractionRequiredAuthError } from '@azure/msal-browser';

/**
 * Interceptor HTTP qui ajoute un header Authorization Bearer with idToken
 * de l'utilisateur actif récupéré depuis MSAL

 * En dev_mode, ne modifie pas la requête

 * Comportement :
 * - Récupère le compte actif MSAL ou le premier compte disponible
 * - Si un idToken existe, clone la requête avec le header Authorization
 * - Sinon laisse la requête inchangée
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (environment.dev_mode) return next(req);

  const msal = inject(MsalService);
  const account = msal.instance.getActiveAccount() ?? msal.instance.getAllAccounts()[0];
  if (!account) return next(req);

  return from(
    msal.acquireTokenSilent({
      account,
      scopes: ['openid', 'profile'],
      cacheLookupPolicy: CacheLookupPolicy.AccessTokenAndRefreshToken,
    }),
  ).pipe(
    catchError((error) => {
      if (error instanceof InteractionRequiredAuthError) {
        msal.acquireTokenRedirect({ account, scopes: ['openid', 'profile'] });
        return EMPTY;
      }
      return throwError(() => error);
    }),
    switchMap((result) =>
      next(
        req.clone({
          setHeaders: { Authorization: `Bearer ${result.idToken}` },
        }),
      ),
    ),
  );
};
