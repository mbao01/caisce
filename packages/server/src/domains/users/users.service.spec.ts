import { PrismaService } from "@/prisma/prisma.service";
import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { User } from "@prisma/client";
import { UsersService } from "./users.service";

const mockUser: User = {
  id: "1",
  email: "test@example.com",
  name: "Test User",
  createdAt: new Date(),
};

describe("UsersService", () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
      },
    } as unknown as PrismaService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe("getUser", () => {
    it("should return user by email", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      const result = await service.getUser({ email: mockUser.email });
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
    });

    it("should return null if user not found", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await service.getUser({ email: "nonexistent@example.com" });
      expect(result).toBeNull();
    });
  });

  describe("createUser", () => {
    it("should create a new user", async () => {
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      const result = await service.createUser({
        email: mockUser.email,
        name: "Test User",
      });
      expect(result).toEqual(mockUser);
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it("should throw BadRequestException if user already exists", async () => {
      (prisma.user.create as jest.Mock).mockRejectedValue(
        new BadRequestException("User already exists")
      );
      await expect(
        service.createUser({
          email: mockUser.email,
          name: "Test User",
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("updateUser", () => {
    it("should update user information", async () => {
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        email: "new@example.com",
      });
      const result = await service.updateUser({
        where: { id: mockUser.id },
        data: { email: "new@example.com" },
      });
      expect(result).toEqual({ ...mockUser, email: "new@example.com" });
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it("should throw error if user not found", async () => {
      (prisma.user.update as jest.Mock).mockResolvedValue(null);
      await expect(
        service.updateUser({ where: { id: "nonexistent" }, data: { email: "new@example.com" } })
      ).resolves.toBeNull();
    });
  });

  describe("deleteUser", () => {
    it("should delete user", async () => {
      (prisma.user.delete as jest.Mock).mockResolvedValue(mockUser);
      const result = await service.deleteUser({ id: mockUser.id });
      expect(result).toEqual(mockUser);
      expect(prisma.user.delete).toHaveBeenCalled();
    });

    it("should throw error if user not found", async () => {
      (prisma.user.delete as jest.Mock).mockRejectedValue(new Error("User not found"));
      await expect(service.deleteUser({ id: "nonexistent" })).rejects.toThrow();
    });
  });

  describe("getUsers", () => {
    it("should return all users", async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([mockUser]);
      const result = await service.getUsers({});
      expect(result).toEqual([mockUser]);
      expect(prisma.user.findMany).toHaveBeenCalled();
    });

    it("should return empty array if no users", async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
      const result = await service.getUsers({});
      expect(result).toEqual([]);
    });
  });
});
