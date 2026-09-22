import { countries, countryFlag } from "../data/countries";

export default function CountrySelect({ name = "country", id, label = "País", value = "Colombia", onChange }: { name?: string; id?: string; label?: string; value?: string; onChange?: (value: string) => void }) {
  return (
    <label htmlFor={id ?? name}>{label}
      <select id={id ?? name} name={name} value={value} onChange={(event) => onChange?.(event.target.value)} required autoComplete="country-name">
        {countries.map((country) => <option key={country.code} value={country.name}>{countryFlag(country.code)} {country.name}</option>)}
      </select>
    </label>
  );
}
