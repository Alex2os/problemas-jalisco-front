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
  error?: string;
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
  let selected: Coordinates | undefined;
  const publish = (state: AddressLookupState) => { previous = state; onChange(state); };

  function select(coordinates: Coordinates, force = false) {
    if (disposed) return;
    if (!force && selected?.latitude === coordinates.latitude && selected.longitude === coordinates.longitude) return;
    selected = coordinates;
    const request = ++version;
    if (timer !== undefined) cancel(timer);
    const empty = { ...coordinates, address: "", colonia: "", municipality: "", error: "" };
    // Clear the previous address immediately, rather than showing it for the new pin.
    const retryError = force && previous?.latitude === coordinates.latitude && previous.longitude === coordinates.longitude ? previous.error : "";
    publish({ ...empty, status: "loading", error: retryError || "" });
    timer = schedule(() => {
      timer = undefined;
      void (async () => {
        try {
          const results = await lookup(coordinates);
          if (disposed || request !== version) return;
          const address = results[0];
          if (!address) { publish({ ...empty, status: "unavailable", error: "No se encontró una dirección para este punto. Puedes ajustar el mapa o confirmar la ubicación seleccionada." }); return; }
          const street = [address.street, address.streetNumber].filter(Boolean).join(" ").trim();
          publish({
            ...coordinates,
            status: "ready",
            error: "",
            address: street || address.name || "",
            colonia: address.district || "",
            municipality: address.city || address.subregion || address.region || "",
          });
        } catch (failure) {
          if (!disposed && request === version) publish({ ...empty, status: "error", error: failure instanceof Error ? failure.message : "No se pudo obtener la dirección. Intenta de nuevo." });
        }
      })();
    }, delay);
  }

  return {
    select,
    move(coordinates: Coordinates) {
      if (disposed || (previous?.latitude === coordinates.latitude && previous.longitude === coordinates.longitude)) return;
      version++;
      selected = undefined;
      if (timer !== undefined) cancel(timer);
      timer = undefined;
      publish({ ...coordinates, address: "", colonia: "", municipality: "", error: "", status: "loading" });
    },
    dispose() {
      disposed = true;
      version++;
      if (timer !== undefined) cancel(timer);
    },
  };
}
