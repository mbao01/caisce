import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { JwtRefreshGuard } from "./jwt-refresh.guard";

describe("JwtRefreshGuard", () => {
  let reflector: Reflector;
  let guard: JwtRefreshGuard;
  let mockContext: Partial<ExecutionContext>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;

    guard = new JwtRefreshGuard(reflector);

    mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("canActivate", () => {
    it("should return true if route is public", () => {
      (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);

      const context = mockContext as ExecutionContext;
      expect(guard.canActivate(context)).toBe(true);
    });

    it("should call super.canActivate if route is not public", () => {
      (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
      const guard = new JwtRefreshGuard(reflector);

      const context = mockContext as ExecutionContext;

      const superCanActivateSpy = jest
        .spyOn(Object.getPrototypeOf(guard), "canActivate")
        .mockReturnValue(true);

      const result = guard.canActivate(context);
      expect(result).toBe(true);
      expect(superCanActivateSpy).toHaveBeenCalledWith(context);
    });
  });

  describe("handleRequest", () => {
    it("should return user if present", () => {
      const user = { id: 1 };
      expect(guard.handleRequest(null, user, null)).toBe(user);
    });

    it("should throw UnauthorizedException if user is missing", () => {
      expect(() => guard.handleRequest(null, null, null)).toThrow(UnauthorizedException);
    });

    it("should throw error if err is passed", () => {
      const error = new Error("Some error");
      expect(() => guard.handleRequest(error, null, null)).toThrow(error);
    });
  });
});
