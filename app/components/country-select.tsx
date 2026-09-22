"use client";

import { countries, countryFlag } from "../data/countries";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "../../components/ui/combobox";

export default function CountrySelect({ name = "country", id, label = "País", value = "Colombia", onChange }: { name?: string; id?: string; label?: string; value?: string; onChange?: (value: string) => void }) {
  const selected = countries.find((country) => country.name === value);
  return (
    <label className="country-field" htmlFor={id ?? name}>
      <span>{label}</span>
      <Combobox value={value} onValueChange={(next) => next && onChange?.(next)}>
        <ComboboxInput id={id ?? name} name={name} required autoComplete="country-name" placeholder="Buscar país…" aria-label={label} />
        <ComboboxContent className="country-combobox-content">
          <ComboboxEmpty>No se encontró ese país.</ComboboxEmpty>
          <ComboboxList className="country-combobox-list">
            {countries.map((country) => <ComboboxItem key={country.code} value={country.name}><span className="country-flag" aria-hidden="true">{countryFlag(country.code)}</span><span>{country.name}</span></ComboboxItem>)}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <span className="sr-only" aria-live="polite">Seleccionado: {selected ? `${countryFlag(selected.code)} ${selected.name}` : value}</span>
    </label>
  );
}
