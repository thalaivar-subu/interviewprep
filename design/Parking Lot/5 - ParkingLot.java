// https://www.techinterview.org/post/3233463532/low-level-design-parking-lot/
// Companion code for "2 - LLD Notes.txt" -- class names and method names match the
// pseudocode there 1:1 so the notes and this file can be read side by side.

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.locks.ReentrantLock;

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

enum VehicleType {
    MOTORCYCLE, CAR, BUS
}

// Declared smallest -> largest so ordinal() IS the size rank; SIZE_RANK from the
// pseudocode falls out for free instead of needing a separate lookup map.
enum SpotSize {
    SMALL, MEDIUM, LARGE;

    static SpotSize minimumFor(VehicleType type) {
        return switch (type) {
            case MOTORCYCLE -> SMALL;
            case CAR -> MEDIUM;
            case BUS -> LARGE;
        };
    }

    boolean fits(VehicleType type) {
        return this.ordinal() >= minimumFor(type).ordinal();
    }
}

// ---------------------------------------------------------------------------
// Vehicle
// ---------------------------------------------------------------------------

final class Vehicle {
    final String plate;
    final VehicleType type;

    Vehicle(String plate, VehicleType type) {
        this.plate = plate;
        this.type = type;
    }
}

// ---------------------------------------------------------------------------
// ParkingSpot -- the lock lives HERE, per spot, not on the lot.
// ---------------------------------------------------------------------------

final class ParkingSpot {
    final String spotId;
    final int floor;
    final SpotSize size;
    private final ReentrantLock lock = new ReentrantLock();
    private boolean occupied = false;

    ParkingSpot(String spotId, int floor, SpotSize size) {
        this.spotId = spotId;
        this.floor = floor;
        this.size = size;
    }

    /** Atomically claims this spot if free. Returns false without blocking if it's taken. */
    boolean tryOccupy() {
        lock.lock();
        try {
            if (occupied) return false;
            occupied = true;
            return true;
        } finally {
            lock.unlock();
        }
    }

    void release() {
        lock.lock();
        try {
            occupied = false;
        } finally {
            lock.unlock();
        }
    }
}

// ---------------------------------------------------------------------------
// ParkingFloor -- spots grouped by size so find_spot() scans one bucket, not the floor.
// ---------------------------------------------------------------------------

final class ParkingFloor {
    final int floorNumber;
    private final Map<SpotSize, List<ParkingSpot>> spotsBySize = new EnumMap<>(SpotSize.class);

    ParkingFloor(int floorNumber) {
        this.floorNumber = floorNumber;
        for (SpotSize size : SpotSize.values()) {
            spotsBySize.put(size, new ArrayList<>());
        }
    }

    void addSpot(ParkingSpot spot) {
        spotsBySize.get(spot.size).add(spot);
    }

    /** Tightest-fit-first: try the smallest viable size before falling back to larger ones. */
    ParkingSpot findSpot(VehicleType vehicleType) {
        SpotSize minSize = SpotSize.minimumFor(vehicleType);
        for (SpotSize size : SpotSize.values()) {
            if (size.ordinal() < minSize.ordinal()) continue;   // too small, vehicle wouldn't fit
            for (ParkingSpot spot : spotsBySize.get(size)) {
                if (spot.tryOccupy()) return spot;               // per-spot lock, no floor-wide lock
            }
        }
        return null;
    }
}

// ---------------------------------------------------------------------------
// PricingStrategy -- strategy pattern, swap implementations with zero changes elsewhere
// ---------------------------------------------------------------------------

interface PricingStrategy {
    double calculateFee(Instant entryTime, Instant exitTime, VehicleType vehicleType);
}

final class HourlyPricingStrategy implements PricingStrategy {
    private final Map<VehicleType, Double> ratesByVehicleType;

    HourlyPricingStrategy(Map<VehicleType, Double> ratesByVehicleType) {
        this.ratesByVehicleType = ratesByVehicleType;
    }

    @Override
    public double calculateFee(Instant entryTime, Instant exitTime, VehicleType vehicleType) {
        long minutes = Duration.between(entryTime, exitTime).toMinutes();
        long hours = (minutes + 59) / 60;                // ceiling-round: 61 min bills as 2 hours
        hours = Math.max(hours, 1);                       // minimum 1 hour charged
        return hours * ratesByVehicleType.get(vehicleType);
    }
}

final class FlatRatePricingStrategy implements PricingStrategy {
    private final double flatFee;

    FlatRatePricingStrategy(double flatFee) {
        this.flatFee = flatFee;
    }

    @Override
    public double calculateFee(Instant entryTime, Instant exitTime, VehicleType vehicleType) {
        return flatFee;
    }
}

// ---------------------------------------------------------------------------
// Ticket -- UUID id, never reused. OPEN until exitTime/fee are set (CLOSED).
// ---------------------------------------------------------------------------

final class Ticket {
    final String ticketId;
    final Vehicle vehicle;
    final ParkingSpot spot;
    final Instant entryTime;
    Instant exitTime;   // null while OPEN
    Double fee;         // null while OPEN

    Ticket(Vehicle vehicle, ParkingSpot spot, Instant entryTime) {
        this.ticketId = UUID.randomUUID().toString();
        this.vehicle = vehicle;
        this.spot = spot;
        this.entryTime = entryTime;
    }
}

// ---------------------------------------------------------------------------
// Exceptions
// ---------------------------------------------------------------------------

class LotFullException extends RuntimeException {
    LotFullException(String message) { super(message); }
}

class TicketNotFoundException extends RuntimeException {
    TicketNotFoundException(String message) { super(message); }
}

// ---------------------------------------------------------------------------
// ParkingLot -- coordinates floors + pricing strategy + ticket registry.
// registryLock guards ONLY the shared ticket map; spot state is protected by
// each ParkingSpot's own lock, so two lanes parking in parallel never contend
// on this lock at the same time.
// ---------------------------------------------------------------------------

public final class ParkingLot {
    private final List<ParkingFloor> floors;
    private final PricingStrategy pricingStrategy;
    private final Map<String, Ticket> tickets = new HashMap<>();
    private final ReentrantLock registryLock = new ReentrantLock();

    public ParkingLot(List<ParkingFloor> floors, PricingStrategy pricingStrategy) {
        this.floors = floors;
        this.pricingStrategy = pricingStrategy;
    }

    public Ticket park(Vehicle vehicle) {
        for (ParkingFloor floor : floors) {
            ParkingSpot spot = floor.findSpot(vehicle.type);
            if (spot == null) continue;

            Ticket ticket = new Ticket(vehicle, spot, Instant.now());
            registryLock.lock();
            try {
                tickets.put(ticket.ticketId, ticket);
            } finally {
                registryLock.unlock();
            }
            return ticket;
        }
        throw new LotFullException("No spot available for " + vehicle.type);
    }

    public double unpark(String ticketId) {
        Ticket ticket;
        registryLock.lock();
        try {
            ticket = tickets.get(ticketId);
        } finally {
            registryLock.unlock();
        }
        if (ticket == null) throw new TicketNotFoundException("Unknown ticket: " + ticketId);

        ticket.exitTime = Instant.now();
        ticket.fee = pricingStrategy.calculateFee(ticket.entryTime, ticket.exitTime, ticket.vehicle.type);
        ticket.spot.release();
        return ticket.fee;
    }
}
