import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// ── Mock Prisma client ──────────────────────────────────────
const mockPrisma = {
    user: {
        findUnique: jest.fn(),
        create:     jest.fn(),
        update:     jest.fn(),
        delete:     jest.fn()
    }
};

jest.unstable_mockModule("../Lib/prismaClient.js", () => ({ default: mockPrisma }));
jest.unstable_mockModule("node-fetch", () => ({ default: jest.fn() }));

const { registerUserService, loginUserService, getUserService } = await import("../services/userService.js");

describe("userService", () => {

    beforeEach(() => jest.clearAllMocks());

    // ── registerUserService ──────────────────────────────────
    describe("registerUserService", () => {

        it("throws 400 if required fields are missing", async () => {
            await expect(registerUserService({ name: "Shally", email: "" }))
                .rejects.toMatchObject({ status: 400 });
        });

        it("throws 400 if user already exists", async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ id: 1, email: "test@test.com" });

            await expect(registerUserService({ name: "Shally", email: "test@test.com", password: "pass123" }))
                .rejects.toMatchObject({ status: 400, message: "User already exists" });
        });

        it("creates and returns a new user", async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockPrisma.user.create.mockResolvedValue({ id: 1, name: "Shally", email: "shally@test.com", role: "Passenger" });

            const user = await registerUserService({ name: "Shally", email: "shally@test.com", password: "pass123" });

            expect(user.email).toBe("shally@test.com");
            expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
        });
    });

    // ── loginUserService ─────────────────────────────────────
    describe("loginUserService", () => {

        it("throws 400 if credentials missing", async () => {
            await expect(loginUserService({ email: "", password: "" }))
                .rejects.toMatchObject({ status: 400 });
        });

        it("throws 401 for non-existent user", async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            await expect(loginUserService({ email: "no@one.com", password: "pass" }))
                .rejects.toMatchObject({ status: 401 });
        });
    });

    // ── getUserService ────────────────────────────────────────
    describe("getUserService", () => {

        it("throws 400 for invalid (non-numeric) id", async () => {
            await expect(getUserService("abc"))
                .rejects.toMatchObject({ status: 400 });
        });

        it("throws 404 when user not found", async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            await expect(getUserService("99"))
                .rejects.toMatchObject({ status: 404 });
        });

        it("returns user for valid id", async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ id: 1, name: "Shally", email: "shally@test.com" });

            const user = await getUserService("1");
            expect(user.id).toBe(1);
        });
    });
});
