import { AppService } from "@/app.service";
import { AppController } from "./app.controller";

describe("AppController", () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(() => {
    appService = {
      getHello: jest.fn().mockReturnValue("Hello World"),
    } as unknown as AppService;

    appController = new AppController(appService);
  });

  it("should be defined", () => {
    expect(appController).toBeDefined();
  });

  it('should return "Hello World" from appService', () => {
    const result = appController.getHello();
    expect(result).toBe("Hello World");
    expect(appService.getHello).toHaveBeenCalled();
  });
});
