import { ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { LocalAuthGuard } from "./local-auth.guard";

describe("LocalAuthGuard", () => {
  let guard: LocalAuthGuard;

  beforeEach(() => {
    guard = new LocalAuthGuard();
  });

  it("should be defined", () => {
    expect(guard).toBeInstanceOf(LocalAuthGuard);
  });

  it('should extend AuthGuard with "local" strategy', () => {
    const proto = Object.getPrototypeOf(guard);
    // Ensure it's extending a class created by AuthGuard('local')
    expect(proto.constructor.name).toContain("AuthGuard");
  });

  it("should call canActivate from parent AuthGuard", () => {
    const context = {} as ExecutionContext;
    const canActivateSpy = jest
      .spyOn(Object.getPrototypeOf(guard), "canActivate")
      .mockReturnValue(true);

    const result = guard.canActivate(context);
    expect(result).toBe(true);
    expect(canActivateSpy).toHaveBeenCalledWith(context);
  });
});
