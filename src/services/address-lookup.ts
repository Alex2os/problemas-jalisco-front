export interface Coordinates { latitude: number; longitude: number }
export interface StreetAddress {
  street?: string | null;
  streetNumber?: string | null;
  name?: string | null;
  district?: string | null;
  subregion?: string | null;
  city?: string | null;
  region?: string | null;
}
export interface AddressLookupState extends Coordinates {
  status: "loading" | "ready" | "unavailable" | "error";
  address: string;
  colonia: string;
  municipality: string;
}

export function createAddressLookup({
  lookup, onChange, delay = 350,
  schedule = (callback, milliseconds) => setTimeout(callback, milliseconds),
  cancel = (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
}: {
  lookup: (coordinates: Coordinates) => Promise<StreetAddress[]>;
  onChange: (state: AddressLookupState) => void;
  delay?: number;
  schedule?: (callback: () => void, milliseconds: number) => unknown;
  cancel?: (handle: unknown) => void;
}) {
  let timer: unknown;
  let version = 0;
  let disposed = false;
  let previous: AddressLookupState | undefined;
  const publish = (state: AddressLookupState) => { previous = state; onChange(state); };

  function select(coordinates: Coordinates, force = false) {
    if (disposed) return;
    if (!force && previous?.latitude === coordinates.latitude && previous.longitude === coordinates.longitude) return;
    const request = ++version;
    if (timer !== undefined) cancel(timer);
    const empty = { ...coordinates, address: "", colonia: "", municipality: "" };
    // Clear the previous address immediately, rather than showing it for the new pin.
    publish({ ...empty, status: "loading" });
    timer = schedule(() => {
      timer = undefined;
      void (async () => {
        try {
          const results = await lookup(coordinates);
          if (disposed || request !== version) return;
          const address = results[0];
          if (!address) { publish({ ...empty, status: "unavailable" }); return; }
          const street = [address.street, address.streetNumber].filter(Boolean).join(" ").trim();
          publish({
            ...coordinates,
            status: "ready",
            address: street || address.name || "",
            colonia: address.district || "",
            municipality: address.city || address.subregion || address.region || "",
          });
        } catch {
          if (!disposed && request === version) publish({ ...empty, status: "error" });
        }
      })();
    }, delay);
  }

  return {
    select,
    dispose() {
      disposed = true;
      version++;
      if (timer !== undefined) cancel(timer);
    },
  };
}
