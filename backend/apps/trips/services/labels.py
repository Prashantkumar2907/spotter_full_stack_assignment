from apps.trips.types import Activity, StopKind

ACTIVITY_REMARKS = {
    Activity.BEFORE_TRIP: "Off duty",
    Activity.AFTER_TRIP: "Trip complete, off duty",
    Activity.DRIVE_TO_PICKUP: "Driving to pickup",
    Activity.DRIVE_TO_DROPOFF: "Driving to drop-off",
    Activity.PICKUP: "Pickup, loading (on duty)",
    Activity.DROPOFF: "Drop-off, unloading (on duty)",
    Activity.FUEL: "Fuel stop (on duty)",
    Activity.BREAK: "30-minute break (off duty)",
    Activity.REST: "10-hour rest (sleeper berth)",
    Activity.RESTART: "34-hour restart (off duty)",
}

STOP_KIND_BY_ACTIVITY = {
    Activity.PICKUP: StopKind.PICKUP,
    Activity.DROPOFF: StopKind.DROPOFF,
    Activity.FUEL: StopKind.FUEL,
    Activity.BREAK: StopKind.BREAK,
    Activity.REST: StopKind.REST,
    Activity.RESTART: StopKind.RESTART,
}

STOP_TITLES = {
    StopKind.START: "Start",
    StopKind.PICKUP: "Pickup",
    StopKind.DROPOFF: "Drop-off",
    StopKind.FUEL: "Fuel stop",
    StopKind.BREAK: "30-minute break",
    StopKind.REST: "10-hour rest",
    StopKind.RESTART: "34-hour restart",
}
