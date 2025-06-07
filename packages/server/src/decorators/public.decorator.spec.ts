import { Public, IS_PUBLIC_KEY } from "./public.decorator";
import { SetMetadata } from "@nestjs/common";

describe("Public decorator", () => {
  it("should set metadata", () => {
    @Public()
    class TestClass {}

    const metadata = Reflect.getMetadata(IS_PUBLIC_KEY, TestClass);
    expect(metadata).toBe(true);
  });

  it("should work with method", () => {
    class TestClass {
      @Public()
      testMethod() {}
    }

    const metadata = Reflect.getMetadata(IS_PUBLIC_KEY, TestClass.prototype.testMethod);
    expect(metadata).toBe(true);
  });

  it("should work with static method", () => {
    class TestClass {
      @Public()
      static testMethod() {}
    }

    const metadata = Reflect.getMetadata(IS_PUBLIC_KEY, TestClass.testMethod);
    expect(metadata).toBe(true);
  });

  it("should use SetMetadata", () => {
    // Create a mock class with a method
    class MockClass {
      testMethod() {}
    }

    // Create a mock descriptor
    const descriptor: TypedPropertyDescriptor<any> = {
      value: MockClass.prototype.testMethod,
      writable: true,
      enumerable: true,
      configurable: true,
    };

    // Apply the decorator
    const decorator = Public();
    decorator(MockClass.prototype, "testMethod", descriptor);

    // Check the metadata
    const metadata = Reflect.getMetadata(IS_PUBLIC_KEY, MockClass.prototype.testMethod);
    expect(metadata).toBe(true);
  });
});
