import { describe, it, expect, beforeEach, vi } from "vitest";
import { TestBed } from "@angular/core/testing";
import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from "@angular/common/http";
import { MsalService } from "@azure/msal-angular";
import { of } from "rxjs";

import { authInterceptor } from "./auth.interceptor";
import { environment } from "../../../environments/environment";

describe("authInterceptor", () => {
  let mockMsalService: any;
  let next: ReturnType<typeof vi.fn<HttpHandlerFn>>;
  let originalDevMode: boolean;

  const setDevMode = (value: boolean) => {
    (environment as { dev_mode: boolean }).dev_mode = value;
  };
  const req = new HttpRequest("GET", "/api/data");

  const interceptor: HttpInterceptorFn = (request, handler) =>
    TestBed.runInInjectionContext(() => authInterceptor(request, handler));

  const interceptedRequest = (): HttpRequest<unknown> =>
    next.mock.calls[next.mock.calls.length - 1][0];

  beforeEach(() => {
    mockMsalService = {
      instance: {
        getActiveAccount: vi.fn().mockReturnValue(null),
        getAllAccounts: vi.fn().mockReturnValue([]),
      }
    };

    originalDevMode = environment.dev_mode;
    setDevMode(false);

    TestBed.configureTestingModule({
      providers: [
        { provide: MsalService, useValue: mockMsalService },
      ],
    });

    next = vi.fn<HttpHandlerFn>().mockReturnValue(of({} as HttpEvent<unknown>));
    vi.clearAllMocks();
  });

  afterEach(() => {
    setDevMode(originalDevMode);
  });

  it("should be created", () => {
    expect(interceptor).toBeTruthy();
  });

  describe("dev_mode", () => {
    beforeEach(() => {
      setDevMode(true);
    });

    it("transmet la requête sans la modifier", () => {
      interceptor(req, next);

      expect(next).toHaveBeenCalledExactlyOnceWith(req);
      expect(interceptedRequest().headers.has("Authorization")).toBe(false);
    });

    it("n'interroge pas MSAL", () => {
      interceptor(req, next);

      expect(mockMsalService.instance.getActiveAccount).not.toHaveBeenCalled();
      expect(mockMsalService.instance.getAllAccounts).not.toHaveBeenCalled();
    });
  });

  describe("not dev_mode", () => {
    it("ajoute le header Authorization avec l'idToken du compte actif", () => {
      mockMsalService.instance.getActiveAccount.mockReturnValue({ idToken: "active-token" });

      interceptor(req, next);

      expect(interceptedRequest().headers.get("Authorization")).toBe(
        "Bearer active-token"
      );
    });

    it("utilise le premier compte disponible si aucun compte actif", () => {
      mockMsalService.instance.getActiveAccount.mockReturnValue(null);
      mockMsalService.instance.getAllAccounts.mockReturnValue([
        { idToken: "fallback-token" },
        { idToken: "other-token" },
      ]);

      interceptor(req, next);

      expect(interceptedRequest().headers.get("Authorization")).toBe(
        "Bearer fallback-token"
      );
    });

    it("privilégie le compte actif même si d'autres comptes existent", () => {
      mockMsalService.instance.getActiveAccount.mockReturnValue({ idToken: "active-token" });
      mockMsalService.instance.getAllAccounts.mockReturnValue([{ idToken: "other-token" }]);

      interceptor(req, next);

      expect(interceptedRequest().headers.get("Authorization")).toBe(
        "Bearer active-token"
      );
    });

    it("laisse la requête inchangée si aucun compte n'existe", () => {
      interceptor(req, next);

      expect(next).toHaveBeenCalledExactlyOnceWith(req);
      expect(interceptedRequest().headers.has("Authorization")).toBe(false);
    });

    it("laisse la requête inchangée si le compte n'a pas d'idToken", () => {
      mockMsalService.instance.getActiveAccount.mockReturnValue({ idToken: undefined });

      interceptor(req, next);

      expect(next).toHaveBeenCalledExactlyOnceWith(req);
      expect(interceptedRequest().headers.has("Authorization")).toBe(false);
    });

    it("ne mute pas la requête d'origine (clone)", () => {
      mockMsalService.instance.getActiveAccount.mockReturnValue({ idToken: "active-token" });

      interceptor(req, next);

      expect(req.headers.has("Authorization")).toBe(false);
      expect(interceptedRequest()).not.toBe(req);
    });
  });
});