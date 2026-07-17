"use client";

import { useState } from "react";
import axios from "axios";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import type { FokontanySelection } from "@/types";

interface LocationIQAddress {
  name?: string;
  city?: string;
  county?: string;
  state?: string;
  country?: string;
  country_code?: string;
}

interface LocationIQSuggestion {
  place_id: string;
  lat: string;
  lon: string;
  display_name: string;
  display_place: string;
  display_address: string;
  address?: LocationIQAddress;
}

interface Props {
  value: FokontanySelection | null;
  onChange: (selection: FokontanySelection) => void;
}

function extractFokontanyDistrict(s: LocationIQSuggestion) {
  const fokontany = s.address?.name ?? s.display_place ?? "";
  const district = s.address?.county ?? s.address?.city ?? "";
  return { fokontany, district };
}

export function FokontanyCombobox({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState<LocationIQSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async (input: string) => {
    setLoading(true);
    try {
      const locationUrl = process.env.NEXT_PUBLIC_LOCATION_URL;
      const locationApiKey = process.env.NEXT_PUBLIC_LOCATION_API_KEY;

      if (!locationUrl || !locationApiKey) {
        console.warn("LocationIQ env vars are missing. Please set NEXT_PUBLIC_LOCATION_URL and NEXT_PUBLIC_LOCATION_API_KEY.");
        setSuggestions([]);
        return;
      }

      const response = await axios.get<LocationIQSuggestion[]>(locationUrl, {
        params: {
          key: locationApiKey,
          q: input,
          limit: "5",
        }
      });
      const data = response.data as LocationIQSuggestion[];
      // On garde uniquement les résultats où on peut déduire un nom de fokontany
      const filtered = data.filter((s) => extractFokontanyDistrict(s).fokontany);
      setSuggestions(filtered);
    } catch (error) {
      console.error("Erreur lors de la récupération des suggestions :", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = useDebounce(() => {
    if (searchInput.length > 2) {
      fetchSuggestions(searchInput);
    } else {
      setSuggestions([]);
    }
  }, 300);

  function handleSearchChange(v: string) {
    setSearchInput(v);
    debouncedFetch();
  }

  function selectSuggestion(s: LocationIQSuggestion) {
    const { fokontany, district } = extractFokontanyDistrict(s);
    onChange({
      kind: "new",
      name: fokontany,
      district,
      lat: parseFloat(s.lat),
      lng: parseFloat(s.lon),
    });
    setOpen(false);
    setSearchInput("");
    setSuggestions([]);
  }

  const displayLabel =
    value?.kind === "existing"
      ? `${value.fokontany.name} · ${value.fokontany.district}`
      : value?.kind === "new"
        ? `${value.name} · ${value.district}`
        : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="w-full">
        <div
          role="combobox"
          aria-expanded={open}
          className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm text-foreground flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
        >
          <span className="flex items-center gap-2 truncate">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className={cn("truncate", !displayLabel && "text-muted-foreground")}>
              {displayLabel ?? "Rechercher votre fokontany..."}
            </span>
          </span>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0 opacity-50" />
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-zinc-900 border-border z-50">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Nom du lieu, quartier..."
            value={searchInput}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            {loading && <div className="px-3 py-2 text-xs text-muted-foreground">Recherche...</div>}
            {!loading && suggestions.length === 0 ? (
              <CommandEmpty>Aucun fokontany trouvé.</CommandEmpty>
            ) : (
              <CommandGroup>
                {suggestions.map((s) => {
                  const { fokontany, district } = extractFokontanyDistrict(s);
                  return (
                    <CommandItem
                      key={s.place_id}
                      value={s.display_name}
                      onSelect={() => selectSuggestion(s)}
                      className="flex items-start"
                    >
                      <span className="flex-1">
                        <span className="block text-sm">{fokontany}</span>
                        <span className="block text-xs text-muted-foreground">{district}</span>
                      </span>
                      <Check
                        className={cn(
                          "shrink-0 ml-auto",
                          value?.kind === "new" &&
                            value.name === fokontany &&
                            value.district === district
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}