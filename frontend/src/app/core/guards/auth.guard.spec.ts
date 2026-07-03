import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from "vitest";
import { TestBed } from "@angular/core/testing";
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RouterStateSnapshot,
} from "@angular/router";
import { MsalGuard } from "@azure/msal-angular";
import { of } from "rxjs";

import { authGuard } from "./auth.guard";
import { environment } from "../../../environments/environment";

describe("authGuard", () => {
  let mockMsalGuard: { canActivate: Mock };
  let originalDevMode: boolean;

  const route = {} as ActivatedRouteSnapshot;
  const state = { url: "/guards" } as RouterStateSnapshot;

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  const setDevMode = (value: boolean) => {
    (environment as { dev_mode: boolean }).dev_mode = value;
  };

  beforeEach(() => {
    originalDevMode = environment.dev_mode;
    setDevMode(false);

    mockMsalGuard = {
      canActivate: vi.fn().mockReturnValue(of(true)),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: MsalGuard, useValue: mockMsalGuard }],
    });
  });

  afterEach(() => {
    setDevMode(originalDevMode);
  });

  it("should be created", () => {
    expect(executeGuard).toBeTruthy();
  });

  describe("en dev_mode", () => {
    beforeEach(() => {
      setDevMode(true);
    });

    it("autorise l'accès sans interroger MSAL", () => {
      const result = executeGuard(route, state);

      expect(result).toBe(true);
      expect(mockMsalGuard.canActivate).not.toHaveBeenCalled();
    });
  });

  describe("hors dev_mode", () => {
    it("délègue à MsalGuard avec la route et le state", () => {
      executeGuard(route, state);

      expect(mockMsalGuard.canActivate).toHaveBeenCalledTimes(1);
      expect(mockMsalGuard.canActivate).toHaveBeenCalledWith(route, state);
    });

    it("retourne le résultat de MsalGuard tel quel (accès autorisé)", () => {
      const granted = of(true);
      mockMsalGuard.canActivate.mockReturnValue(granted);

      const result = executeGuard(route, state);
      expect(result).toBe(granted);
    });

    it("retourne le résultat de MsalGuard tel quel (accès refusé)", () => {
      const denied = of(false);
      mockMsalGuard.canActivate.mockReturnValue(denied);

      const result = executeGuard(route, state);
      expect(result).toBe(denied);
    });
  });
});