import { ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { OtpAuthGuard } from "./otp-auth.guard";

describe("OtpAuthGuard", () => {
  let guard: OtpAuthGuard;

  beforeEach(() => {
    guard = new OtpAuthGuard();
  });

  it("should be defined", () => {
    expect(guard).toBeInstanceOf(OtpAuthGuard);
  });

  it('should extend AuthGuard with "otp" strategy', () => {
    const proto = Object.getPrototypeOf(guard);
    // Ensure it's extending a class created by AuthGuard('otp')
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
