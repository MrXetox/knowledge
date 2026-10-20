import {
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MsalBroadcastService,
  MsalGuard,
  MsalGuardConfiguration,
  MsalService
} from "@azure/msal-angular";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { inject, provideAppInitializer } from "@angular/core";
import {
  BrowserCacheLocation,
  InteractionType,
  IPublicClientApplication,
  PublicClientApplication
} from "@azure/msal-browser";
import { environment } from "../../../environments/environment";
import { authInterceptor } from "../interceptors/auth.interceptor";

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.msal.clientId,
      authority: environment.msal.authority,
      redirectUri: environment.msal.redirectUri
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
    }
  })
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: { scopes: ['openid', 'profile'] }
  };
}

export const msal_providers = environment.dev_mode ? [] : [
  provideHttpClient(withInterceptors([authInterceptor])),
  provideAppInitializer(async () => {
    const msal_service = inject(MsalService);
    await msal_service.instance.initialize();

    try {
      const result = await msal_service.instance.handleRedirectPromise();

      if (result?.account) {
        msal_service.instance.setActiveAccount(result.account);
      } else if (!msal_service.instance.getActiveAccount()) {
        const accounts = msal_service.instance.getAllAccounts();
        if (accounts.length > 0) msal_service.instance.setActiveAccount(accounts[0]);
      }
    } catch (error) {
      console.error('[MSAL] Erreur au traitement de la redirection', error);
    }
  }),
  {
    provide: MSAL_INSTANCE,
    useFactory: MSALInstanceFactory
  },
  {
    provide: MSAL_GUARD_CONFIG,
    useFactory: MSALGuardConfigFactory
  },
  MsalService,
  MsalGuard,
  MsalBroadcastService,
]