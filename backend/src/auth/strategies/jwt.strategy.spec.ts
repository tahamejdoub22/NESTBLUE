import { Test, TestingModule } from "@nestjs/testing";
import { JwtStrategy } from "./jwt.strategy";
// Mock bcrypt before importing anything that uses it
jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
  genSalt: jest.fn(),
}));
import { UsersService } from "../../users/users.service";
import { ConfigService } from "@nestjs/config";

describe("JwtStrategy", () => {
  let strategy: JwtStrategy;
  let usersService: Partial<UsersService>;
  let configService: Partial<ConfigService>;

  beforeEach(async () => {
    usersService = {
      findOne: jest.fn().mockResolvedValue({
        id: "user-id",
        email: "test@example.com",
        role: "admin",
      }),
    };

    configService = {
      get: jest.fn().mockReturnValue("secret"),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it("should return user object WITH role", async () => {
    const payload = { sub: "user-id" };
    const result = await strategy.validate(payload);

    expect(usersService.findOne).toHaveBeenCalledWith("user-id");
    expect(result).toHaveProperty("userId", "user-id");
    expect(result).toHaveProperty("email", "test@example.com");
    // This is the check that currently fails (returns undefined instead of 'admin')
    expect(result).toHaveProperty("role", "admin");
  });
});
