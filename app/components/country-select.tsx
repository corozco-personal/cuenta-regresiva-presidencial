import { countries, countryFlag } from "../data/countries";

export default function CountrySelect({ name = "country", id, label = "País" }: { name?: string; id?: string; label?: string }) {
  return (
    <label htmlFor={id ?? name}>{label}
      <select id={id ?? name} name={name} defaultValue="Colombia" required autoComplete="country-name">
        {countries.map((country) => <option key={country.code} value={country.name}>{countryFlag(country.code)} {country.name}</option>)}
      </select>
    </label>
  );
}
