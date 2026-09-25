import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { ChevronDown, Globe, Search } from 'lucide-react';
import type { CountryCode, Examples, MetadataJson } from 'libphonenumber-js/core';

/*
 * Phone number field with a country picker (flag + dialling code), as-you-type formatting and
 * per-country validation.
 *
 * libphonenumber-js and its full metadata (~150 kB) are loaded only when a phone field is on
 * screen, so they stay out of the main bundle. Until they arrive the field still shows the
 * default country and accepts typing. Flags are separate SVG files, fetched only when shown.
 */

type Lib = typeof import('libphonenumber-js/core');
type Loaded = { lib: Lib; metadata: MetadataJson; examples: Examples };

let loading: Promise<Loaded> | null = null;
function loadPhoneLib(): Promise<Loaded> {
  loading ??= Promise.all([
    import('libphonenumber-js/core'),
    import('libphonenumber-js/metadata.max.json'),
    import('libphonenumber-js/examples.mobile.json'),
  ]).then(([lib, metadata, examples]) => ({
    lib,
    metadata: (metadata.default ?? metadata) as unknown as MetadataJson,
    examples: (examples.default ?? examples) as unknown as Examples,
  }));
  return loading;
}

// One URL per flag; vite.config.ts keeps these as separate files instead of inlining them.
const FLAG_FILES = import.meta.glob('/node_modules/country-flag-icons/3x2/*.svg', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const FLAGS: Record<string, string> = Object.fromEntries(
  Object.entries(FLAG_FILES).map(([path, url]) => [path.slice(path.lastIndexOf('/') + 1, -4), url]),
);

// Shown first in the list: the Gulf, India and the agency's most frequent overseas buyers.
const PREFERRED: CountryCode[] = ['AE', 'IN', 'SA', 'QA', 'KW', 'OM', 'BH', 'GB', 'US'];
// Dialling codes for the default countries, so the field is complete before the library loads.
const BOOT_CODES: Partial<Record<CountryCode, string>> = { AE: '971', IN: '91' };

const regionNames = (() => {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' });
  } catch {
    return null;
  }
})();
const countryName = (code: string) => {
  try {
    return regionNames?.of(code) ?? code;
  } catch {
    return code;
  }
};

export type PhoneChange = {
  /**
   * With valueFormat "international" (default): "+971 50 123 4567", or "+971 5012" while
   * incomplete. With "digits": "971501234567" (country code + number, no +). "" when empty.
   */
  value: string;
  /** E.164, e.g. "+971501234567"; "" unless the number is valid. */
  e164: string;
  valid: boolean;
  country: CountryCode;
};

type Props = {
  id?: string;
  value: string;
  onChange: (change: PhoneChange) => void;
  defaultCountry?: CountryCode;
  /** 'underline' matches the public enquiry forms, 'boxed' the admin inputs. */
  variant?: 'underline' | 'boxed';
  /** Shape of `value`: "+971 50 123 4567" or digits only ("971501234567", as wa.me links need). */
  valueFormat?: 'international' | 'digits';
  required?: boolean;
  /** Show the validation message even if the field has not been left yet (e.g. after submit). */
  showError?: boolean;
  /** Extra error from the parent (e.g. a server message); takes the place of the built-in one. */
  error?: string;
  testId?: string;
  ariaLabel?: string;
};

type Option = { code: CountryCode; name: string; dial: string };

function Flag({ code }: { code: string }) {
  const src = FLAGS[code];
  if (!src) return <Globe size={16} className="shrink-0 text-[#202635]/50" aria-hidden="true" />;
  return <img src={src} alt="" width={20} height={14} loading="lazy" decoding="async" className="h-[14px] w-5 shrink-0 rounded-[2px] object-cover ring-1 ring-black/10" />;
}

export function PhoneInput({ id, value, onChange, defaultCountry = 'AE', variant = 'underline', valueFormat = 'international', required, showError, error, testId = 'input-phone', ariaLabel }: Props) {
  const autoId = useId();
  const inputId = id ?? `phone-${autoId}`;
  const listId = `${inputId}-countries`;
  const hintId = `${inputId}-hint`;

  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [country, setCountry] = useState<CountryCode>(defaultCountry);
  const [national, setNational] = useState('');
  // Raw "+4…" text while an international number is typed and its country is not known yet.
  const [draft, setDraft] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [open, setOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const caretDigits = useRef<number | null>(null);
  const lastEmitted = useRef<string | null>(null);

  useEffect(() => {
    let alive = true;
    loadPhoneLib().then((result) => { if (alive) setLoaded(result); }).catch(() => undefined);
    return () => { alive = false; };
  }, []);

  const dialFor = useCallback((code: CountryCode) => {
    if (loaded) {
      try { return loaded.lib.getCountryCallingCode(code, loaded.metadata); } catch { return ''; }
    }
    return BOOT_CODES[code] ?? '';
  }, [loaded]);

  const options = useMemo<Option[]>(() => {
    if (!loaded) return PREFERRED.filter((code) => BOOT_CODES[code]).map((code) => ({ code, name: countryName(code), dial: BOOT_CODES[code] ?? '' }));
    const all = loaded.lib.getCountries(loaded.metadata).map((code) => ({ code, name: countryName(code), dial: loaded.lib.getCountryCallingCode(code, loaded.metadata) }));
    const byName = [...all].sort((a, b) => a.name.localeCompare(b.name));
    const preferred = PREFERRED.map((code) => all.find((option) => option.code === code)).filter(Boolean) as Option[];
    return [...preferred, ...byName.filter((option) => !PREFERRED.includes(option.code))];
  }, [loaded]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, '');
    if (!q) return options;
    const digits = q.replace(/\D/g, '');
    return options.filter((option) =>
      option.name.toLowerCase().includes(q) ||
      option.code.toLowerCase() === q ||
      (digits && digits === q && option.dial.startsWith(digits)),
    );
  }, [options, query]);

  // --- Deriving the value --------------------------------------------------------------------

  const evaluate = useCallback((digits: string, code: CountryCode): PhoneChange => {
    if (!digits) return { value: '', e164: '', valid: false, country: code };
    const shape = (callingCode: string, rest: string) => (valueFormat === 'digits' ? `${callingCode}${rest}` : `+${callingCode} ${rest}`);
    if (loaded) {
      const parsed = loaded.lib.parsePhoneNumberFromString(digits, code, loaded.metadata);
      if (parsed && parsed.isValid()) {
        return { value: valueFormat === 'digits' ? parsed.number.slice(1) : parsed.formatInternational(), e164: parsed.number, valid: true, country: code };
      }
      if (parsed) return { value: shape(parsed.countryCallingCode, parsed.nationalNumber), e164: '', valid: false, country: code };
    }
    return { value: shape(dialFor(code), digits.replace(/^0+/, '')), e164: '', valid: false, country: code };
  }, [dialFor, loaded, valueFormat]);

  const status = useMemo(() => evaluate(national, country), [evaluate, national, country]);

  const emit = useCallback((digits: string, code: CountryCode) => {
    const next = evaluate(digits, code);
    lastEmitted.current = next.value;
    onChange(next);
  }, [evaluate, onChange]);

  // Take an incoming value (initial load, or the parent resetting the form) apart into
  // country + national digits. Values the field emitted itself are ignored.
  useEffect(() => {
    if (value === lastEmitted.current) return;
    if (!value.trim()) {
      setNational('');
      setDraft(null);
      return;
    }
    if (!loaded) return;
    // Stored numbers are "+971 58 514 1770" or digits with the country code ("971585141770").
    const text = value.trim().startsWith('+') ? value.trim() : `+${value.replace(/\D/g, '')}`;
    const parsed = loaded.lib.parsePhoneNumberFromString(text, loaded.metadata);
    if (parsed) {
      const code = parsed.country ?? (loaded.metadata.country_calling_codes[parsed.countryCallingCode]?.[0] as CountryCode | undefined);
      if (code) setCountry(code);
      setNational(parsed.nationalNumber);
      lastEmitted.current = value;
    }
  }, [value, loaded]);

  // When the library arrives after the user already typed, report the now-validated value.
  useEffect(() => {
    if (loaded && national && lastEmitted.current !== null) emit(national, country);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const display = useMemo(() => {
    if (draft !== null) return draft;
    if (!national) return '';
    if (!loaded) return national;
    // Numbers typed with the trunk prefix ("050…", "020…", "8 912…") and countries such as the
    // US or India format in national style. Numbers typed without it ("50 123 4567", as people
    // do next to a +971 picker) only format in international style, so format them that way
    // and drop the "+971" the country button already shows.
    const nationalStyle = new loaded.lib.AsYouType(country, loaded.metadata).input(national);
    if (/\D/.test(nationalStyle)) return nationalStyle;
    const prefix = `+${dialFor(country)}`;
    const internationalStyle = new loaded.lib.AsYouType(undefined, loaded.metadata).input(`${prefix}${national}`);
    return internationalStyle.startsWith(prefix) ? internationalStyle.slice(prefix.length).trim() : national;
  }, [draft, national, country, loaded, dialFor]);

  // Keep the caret after the same digit once the number has been reformatted.
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (caretDigits.current === null || !input || document.activeElement !== input) return;
    let seen = 0;
    let position = display.length;
    if (caretDigits.current === 0) position = 0;
    else {
      for (let i = 0; i < display.length; i += 1) {
        if (/\d/.test(display[i])) seen += 1;
        if (seen === caretDigits.current) { position = i + 1; break; }
      }
    }
    input.setSelectionRange(position, position);
    caretDigits.current = null;
  }, [display]);

  // --- Typing ----------------------------------------------------------------------------------

  // A full international number typed or pasted ("+44 20…" or "0044 20…"): work out the
  // country from its calling code and keep only the national part in the field.
  const takeInternational = (typed: string) => {
    const text = typed.trim().replace(/^00/, '+');
    if (loaded) {
      const formatter = new loaded.lib.AsYouType(undefined, loaded.metadata);
      formatter.input(text);
      const callingCode = formatter.getCallingCode();
      const detected = (formatter.getCountry() ??
        (callingCode && dialFor(country) === callingCode ? country : undefined) ??
        (callingCode ? (loaded.metadata.country_calling_codes[callingCode]?.[0] as CountryCode | undefined) : undefined));
      if (detected && callingCode) {
        const rest = formatter.getNumber()?.nationalNumber ?? '';
        setDraft(null);
        setCountry(detected);
        setNational(rest);
        caretDigits.current = rest.length;
        emit(rest, detected);
        return;
      }
    }
    // Calling code not complete yet (or the library is still loading): show what was typed.
    setDraft(text.replace(/[^\d+\s]/g, ''));
    setNational('');
    emit('', country);
  };

  // Typed before the library arrived: read it again now that the country can be worked out.
  useEffect(() => {
    if (loaded && draft) takeInternational(draft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const caret = event.target.selectionStart ?? raw.length;
    if (/^\s*(\+|00)/.test(raw)) {
      takeInternational(raw);
      return;
    }

    setDraft(null);
    const digits = raw.replace(/\D/g, '').slice(0, 17);
    caretDigits.current = raw.slice(0, caret).replace(/\D/g, '').length;
    setNational(digits);
    emit(digits, country);
  };

  // --- Country menu ----------------------------------------------------------------------------

  const openMenu = () => {
    const box = wrapperRef.current?.getBoundingClientRect();
    if (box) {
      const below = window.innerHeight - box.bottom;
      setOpenUp(below < 340 && box.top > below);
    }
    setQuery('');
    const index = options.findIndex((option) => option.code === country);
    setActive(index < 0 ? 0 : index);
    setOpen(true);
  };

  const closeMenu = (focusButton = true) => {
    setOpen(false);
    if (focusButton) buttonRef.current?.focus();
  };

  const choose = (code: CountryCode) => {
    setDraft(null);
    setCountry(code);
    emit(national, code);
    setOpen(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const onPointer = (event: MouseEvent | TouchEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
    };
  }, [open]);

  useEffect(() => { setActive(0); }, [query]);

  useEffect(() => {
    if (!open) return;
    const item = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    item?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const onSearchKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive((i) => Math.min(i + 1, filtered.length - 1)); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (event.key === 'Home') { event.preventDefault(); setActive(0); }
    else if (event.key === 'End') { event.preventDefault(); setActive(filtered.length - 1); }
    else if (event.key === 'Enter') { event.preventDefault(); if (filtered[active]) choose(filtered[active].code); }
    else if (event.key === 'Escape') { event.preventDefault(); closeMenu(); }
    else if (event.key === 'Tab') setOpen(false);
  };

  const onButtonKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); openMenu(); }
  };

  // --- Validation message ----------------------------------------------------------------------

  const example = useMemo(() => {
    if (!loaded) return '';
    try {
      // Shown next to the country button, so without the "+971" and without the trunk "0".
      const sample = loaded.lib.getExampleNumber(country, loaded.examples, loaded.metadata);
      if (!sample) return '';
      const prefix = `+${sample.countryCallingCode}`;
      const international = sample.formatInternational();
      return international.startsWith(prefix) ? international.slice(prefix.length).trim() : sample.formatNational();
    } catch {
      return '';
    }
  }, [loaded, country]);

  const builtInError = !loaded ? '' : !national ? (required && showError ? 'Please enter your phone number.' : '') : status.valid ? '' : `This doesn't look like a valid ${countryName(country)} number${example ? `, e.g. ${example}` : ''}.`;
  const message = error || ((touched || showError) ? builtInError : '');
  const invalid = Boolean(message);

  const boxed = variant === 'boxed';
  const wrapperClass = boxed
    ? `mt-1.5 flex items-stretch rounded-sm border bg-white text-sm transition-colors ${invalid ? 'border-[#b23b2e]' : 'border-[#202635]/20 focus-within:border-[#c97352]'}`
    : `mt-3 flex items-stretch border-b transition-colors ${invalid ? 'border-[#c97352]' : 'border-[#202635]/25 focus-within:border-[#c97352]'}`;
  const buttonClass = boxed
    ? 'flex shrink-0 items-center gap-1.5 rounded-l-sm px-3 py-2.5 text-sm text-[#202635] outline-none hover:bg-[#202635]/[.04] focus-visible:bg-[#202635]/[.06]'
    : 'flex shrink-0 items-center gap-1.5 py-3 pr-3 text-base text-[#202635] outline-none hover:text-[#c97352] focus-visible:text-[#c97352]';
  const inputClass = boxed
    ? 'min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-[#202635]/35'
    : 'min-w-0 flex-1 bg-transparent py-3 pl-3 text-base outline-none placeholder:text-[#202635]/30';

  return (
    <div ref={wrapperRef} className="relative">
      <div className={wrapperClass}>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => (open ? closeMenu(false) : openMenu())}
          onKeyDown={onButtonKey}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-label={`Country code: ${countryName(country)} +${dialFor(country)}. Change country`}
          className={buttonClass}
          data-testid={`${testId}-country`}
        >
          <Flag code={country} />
          <span className="tabular-nums">+{dialFor(country)}</span>
          <ChevronDown size={14} className={`text-[#202635]/45 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        <span aria-hidden="true" className={boxed ? 'my-2 w-px bg-[#202635]/15' : 'my-3 w-px bg-[#202635]/15'} />
        <input
          ref={inputRef}
          id={inputId}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required={required}
          value={display}
          onChange={handleInput}
          onBlur={() => setTouched(true)}
          placeholder={example || (country === 'AE' ? '50 123 4567' : '')}
          aria-label={ariaLabel}
          aria-invalid={invalid || undefined}
          aria-describedby={message ? hintId : undefined}
          className={inputClass}
          data-testid={testId}
        />
      </div>

      {open && (
        <div
          className={`absolute left-0 z-40 w-full min-w-[16rem] max-w-[24rem] overflow-hidden rounded-sm border border-[#202635]/15 bg-[#fcfaf6] shadow-[0_18px_40px_-18px_rgba(32,38,53,.45)] ${openUp ? 'bottom-full mb-2' : 'top-full mt-2'}`}
          data-testid={`${testId}-menu`}
        >
          <div className="flex items-center gap-2 border-b border-[#202635]/10 px-3">
            <Search size={14} className="shrink-0 text-[#202635]/40" aria-hidden="true" />
            <input
              ref={searchRef}
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={filtered[active] ? `${listId}-${filtered[active].code}` : undefined}
              aria-label="Search countries"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onSearchKey}
              placeholder="Search country or code"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-[#202635]/40"
              data-testid={`${testId}-search`}
            />
          </div>
          <ul ref={listRef} id={listId} role="listbox" aria-label="Countries" className="max-h-64 overflow-y-auto overscroll-contain py-1">
            {filtered.length === 0 && <li className="px-3 py-3 text-sm text-[#202635]/50">No country matches “{query}”.</li>}
            {filtered.map((option, index) => (
              <li
                key={option.code}
                id={`${listId}-${option.code}`}
                role="option"
                aria-selected={option.code === country}
                data-index={index}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(option.code)}
                onMouseEnter={() => setActive(index)}
                className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-sm ${index === active ? 'bg-[#202635]/[.06]' : ''} ${option.code === country ? 'font-medium text-[#202635]' : 'text-[#202635]/80'} ${!query && index === PREFERRED.length - 1 && loaded ? 'border-b border-[#202635]/10' : ''}`}
                data-testid={`${testId}-option-${option.code}`}
              >
                <Flag code={option.code} />
                <span className="min-w-0 flex-1 truncate">{option.name}</span>
                <span className="shrink-0 tabular-nums text-[#202635]/50">+{option.dial}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {message && (
        <p id={hintId} role="alert" className={`mt-1.5 text-xs ${boxed ? 'text-[#b23b2e]' : 'text-[#c97352]'}`} data-testid={`${testId}-error`}>
          {message}
        </p>
      )}
    </div>
  );
}
