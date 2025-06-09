import { ExecutionContext } from "@nestjs/common";
import { GoogleOauthGuard } from "./google-oauth.guard";

describe("GoogleOauthGuard", () => {
  let guard: GoogleOauthGuard;

  beforeEach(() => {
    guard = new GoogleOauthGuard();
  });

  it("should return authenticate options with state from query", () => {
    // Mock query params
    const mockQuery = {
      redirectUrl: "/dashboard",
      source: "popup",
    };

    // Mock ExecutionContext
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: mockQuery,
        }),
      }),
    } as unknown as ExecutionContext;

    const options = guard.getAuthenticateOptions(mockExecutionContext);

    expect(options).toEqual({
      state: Buffer.from(JSON.stringify(mockQuery)).toString("base64"),
    });
  });

  it("should return empty object if query is empty", () => {
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          query: {},
        }),
      }),
    } as unknown as ExecutionContext;

    const options = guard.getAuthenticateOptions(mockExecutionContext);

    expect(options).toEqual({
      state: Buffer.from(JSON.stringify({})).toString("base64"),
    });
  });
});
