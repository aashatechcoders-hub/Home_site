// Tiny event bus so HTML widgets and the 3D world can stay in sync without
// importing each other (the world is loaded lazily).
export const bus = new EventTarget();
export const emit = (type, detail) => bus.dispatchEvent(new CustomEvent(type, { detail }));
