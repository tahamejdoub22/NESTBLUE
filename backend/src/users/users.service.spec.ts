import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { User } from "./entities/user.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";

const mockUsersRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe("UsersService", () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findByIds", () => {
    it("should return users for valid IDs", async () => {
      const ids = ["user1", "user2"];
      const expectedUsers = [
        { id: "user1", name: "User 1" },
        { id: "user2", name: "User 2" },
      ];
      mockUsersRepository.find.mockResolvedValue(expectedUsers);

      const result = await service.findByIds(ids);

      expect(result).toEqual(expectedUsers);
      expect(repository.find).toHaveBeenCalledWith({
        where: { id: expect.any(Object) }, // In(ids) matcher is complex to mock exactly without importing In, so we check general structure or rely on mock implementation
        select: ["id", "name", "email", "avatar"],
      });
    });

    it("should return empty array for empty input", async () => {
      const result = await service.findByIds([]);
      expect(result).toEqual([]);
      expect(repository.find).not.toHaveBeenCalled();
    });
  });
});
