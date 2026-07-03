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
    await msal_service.instance.handleRedirectPromise();
    const accounts = msal_service.instance.getAllAccounts();
    if (accounts.length > 0) {
      msal_service.instance.setActiveAccount(accounts[0]);
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