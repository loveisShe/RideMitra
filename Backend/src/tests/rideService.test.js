import { describe, it, expect, beforeEach, jest } from "@jest/globals";

const mockPrisma = {
    ride:    { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), findMany: jest.fn() },
    booking: { create: jest.fn(), findUnique: jest.fn() },
    user:    { findUnique: jest.fn() },
    notification: { create: jest.fn() }
};

jest.unstable_mockModule("../Lib/prismaClient.js", () => ({ default: mockPrisma }));

const { postRideService, getAllRidesService } = await import("../services/rideService.js");

describe("rideService", () => {

    beforeEach(() => jest.clearAllMocks());

    // ── postRideService ──────────────────────────────────────
    describe("postRideService", () => {

        it("throws 400 if required fields are missing", async () => {
            await expect(postRideService({ pickup: "Delhi", destination: "", date: "", time: "", fare: 0, seats: 0, userId: 1 }))
                .rejects.toMatchObject({ status: 400 });
        });

        it("creates and returns a new ride", async () => {
            const fakeRide = { id: 1, pickup: "Delhi", destination: "Mumbai" };
            mockPrisma.ride.create.mockResolvedValue(fakeRide);

            const ride = await postRideService({
                pickup: "Delhi", destination: "Mumbai", date: "2026-06-01",
                time: "08:00", fare: 500, seats: 3, userId: 1
            });

            expect(ride.id).toBe(1);
            expect(mockPrisma.ride.create).toHaveBeenCalledTimes(1);
        });
    });

    // ── getAllRidesService ────────────────────────────────────
    describe("getAllRidesService", () => {

        it("returns all rides when no filters given", async () => {
            mockPrisma.ride.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);

            const rides = await getAllRidesService({});
            expect(rides).toHaveLength(2);
        });
    });
});
