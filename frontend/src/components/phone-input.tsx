import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Globe, Search } from 'lucide-react';
import type { CountryCode, Examples, MetadataJson, PhoneNumber } from 'libphonenumber-js/core';

/*
 * Phone number field with a country picker (flag + dialling code), as-you-type formatting and
 * per-country validation.
 *
 * libphonenumber-js and its full metadata (~150 kB) are loaded only when a phone field is on
 * screen, so they stay out of the main bundle. Until they arrive the field still shows the
 * default country and accepts typing; if they cannot be loaded at all (a flaky connection, or
 * a tab left open across a deploy) the field falls back to the server's own rule, so an
 * enquiry can always be sent. Flags are separate SVG files, fetched only when shown.
 */

type Lib = typeof import('libphonenumber-js/core');
type Loaded = { lib: Lib; metadata: MetadataJson; examples: Examples };

let loading: Promise<Loaded> | null = null;
function loadPhoneLib(): Promise<Loaded> {
  loading ??= Promise.all([
    import('libphonenumber-js/core'),
    import('libphonenumber-js/metadata.max.json'),
    import('libphonenumber-js/examples.mobile.json'),
  ])
    .then(([lib, metadata, examples]) => ({
      lib,
      metadata: (metadata.default ?? metadata) as unknown as MetadataJson,
      examples: (examples.default ?? examples) as unknown as Examples,
    }))
    .catch((error) => {
      loading = null; // let a later attempt try again
      throw error;
    });
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
// Names people type that differ from the official English names.
const ALIASES: Partial<Record<CountryCode, string[]>> = {
  AE: ['uae', 'emirates', 'dubai', 'abu dhabi'],
  GB: ['uk', 'britain', 'great britain', 'england', 'scotland', 'wales'],
  US: ['usa', 'america', 'united states of america'],
  SA: ['ksa', 'saudi'],
  IN: ['bharat'],
  TR: ['turkey'],
  SZ: ['swaziland'],
  CI: ['ivory coast'],
  CZ: ['czech republic'],
  MK: ['macedonia'],
  NL: ['holland'],
  KR: ['korea', 'south korea'],
  KP: ['north korea'],
  MM: ['burma'],
  CD: ['drc', 'democratic republic of congo'],
  CV: ['cape verde'],
  TL: ['east timor'],
  VA: ['vatican'],
};

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
const normalize = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/&/g, ' and ').replace(/\bst\.?\s/g, 'saint ').replace(/[.'’(),-]/g, ' ').replace(/\s+/g, ' ').trim();
// Keeps an example number on one line inside a sentence.
const noBreak = (text: string) => text.replace(/ /g, ' ');

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
  /** Id of a hint rendered by the parent, read out together with the field. */
  describedBy?: string;
  testId?: string;
  ariaLabel?: string;
};

type Option = { code: CountryCode; name: string; dial: string; search: string };
type MenuBox = { left: number; width: number; listHeight: number; above: boolean; top?: number; bottom?: number };

function Flag({ code }: { code: string }) {
  const src = FLAGS[code];
  if (!src) return <Globe size={16} className="shrink-0 text-[#202635]/50" aria-hidden="true" />;
  return <img src={src} alt="" width={20} height={14} loading="lazy" decoding="async" className="h-[14px] w-5 shrink-0 rounded-[2px] object-cover ring-1 ring-black/10" />;
}

export function PhoneInput({ id, value, onChange, defaultCountry = 'AE', variant = 'underline', valueFormat = 'international', required, showError, error, describedBy, testId = 'input-phone', ariaLabel }: Props) {
  const autoId = useId();
  const inputId = id ?? `phone-${autoId}`;
  const listId = `${inputId}-countries`;
  const hintId = `${inputId}-hint`;
  const countryId = `${inputId}-country-name`;

  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [failed, setFailed] = useState(false);
  const [country, setCountry] = useState<CountryCode>(defaultCountry);
  const [national, setNational] = useState('');
  // Raw "+4…" text while an international number is typed and its country is not known yet.
  const [draft, setDraft] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [open, setOpen] = useState(false);
  const [box, setBox] = useState<MenuBox | null>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  // Bumped on every keystroke so the caret is put back even when the text did not change.
  const [edit, setEdit] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const caretDigits = useRef<number | null>(null);
  const lastEmitted = useRef<string | null>(null);

  const load = useCallback(() => {
    loadPhoneLib().then((result) => { setLoaded(result); setFailed(false); }).catch(() => setFailed(true));
  }, []);
  useEffect(() => { load(); }, [load]);

  const dialFor = useCallback((code: CountryCode) => {
    if (loaded) {
      try { return loaded.lib.getCountryCallingCode(code, loaded.metadata); } catch { return ''; }
    }
    return BOOT_CODES[code] ?? '';
  }, [loaded]);

  const parse = useCallback((text: string, code?: CountryCode): PhoneNumber | undefined => {
    if (!loaded) return undefined;
    try {
      return code ? loaded.lib.parsePhoneNumberFromString(text, code, loaded.metadata) : loaded.lib.parsePhoneNumberFromString(text, loaded.metadata);
    } catch {
      return undefined;
    }
  }, [loaded]);

  const options = useMemo<Option[]>(() => {
    const make = (code: CountryCode, dial: string): Option => {
      const name = countryName(code);
      return { code, name, dial, search: normalize([name, ...(ALIASES[code] ?? [])].join(' | ')) };
    };
    if (!loaded) return PREFERRED.filter((code) => BOOT_CODES[code]).map((code) => make(code, BOOT_CODES[code] ?? ''));
    const all = loaded.lib.getCountries(loaded.metadata).map((code) => make(code, loaded.lib.getCountryCallingCode(code, loaded.metadata)));
    const byName = [...all].sort((a, b) => a.name.localeCompare(b.name));
    const preferred = PREFERRED.map((code) => all.find((option) => option.code === code)).filter(Boolean) as Option[];
    return [...preferred, ...byName.filter((option) => !PREFERRED.includes(option.code))];
  }, [loaded]);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return options;
    const asCode = q.replace(/^(\+|00)/, '').replace(/[\s-]/g, '');
    if (/^\d+$/.test(asCode)) {
      return options
        .filter((option) => option.dial.startsWith(asCode))
        .sort((a, b) => Number(b.dial === asCode) - Number(a.dial === asCode));
    }
    const nq = normalize(q);
    const rank = (option: Option) => {
      const aliases = ALIASES[option.code] ?? [];
      if (option.code.toLowerCase() === nq || aliases.includes(nq)) return 0;
      if (normalize(option.name).startsWith(nq)) return 1;
      if (aliases.some((alias) => alias.startsWith(nq))) return 2;
      return option.search.includes(nq) ? 3 : 9;
    };
    return options
      .map((option, index) => ({ option, index, score: rank(option) }))
      .filter((entry) => entry.score < 9)
      .sort((a, b) => a.score - b.score || a.index - b.index)
      .map((entry) => entry.option);
  }, [options, query]);

  // --- Deriving the value --------------------------------------------------------------------

  const evaluate = useCallback((digits: string, code: CountryCode): PhoneChange => {
    if (!digits) return { value: '', e164: '', valid: false, country: code };
    const shape = (callingCode: string, rest: string) => (valueFormat === 'digits' ? `${callingCode}${rest}` : `+${callingCode} ${rest}`);
    if (loaded) {
      const parsed = parse(digits, code);
      if (parsed) {
        const e164Digits = parsed.number.length - 1;
        // 7-15 digits is also the server's rule, so a number accepted here is never rejected there.
        if (parsed.isValid() && e164Digits >= 7 && e164Digits <= 15) {
          return { value: valueFormat === 'digits' ? parsed.number.slice(1) : parsed.formatInternational(), e164: parsed.number, valid: true, country: code };
        }
        return { value: shape(parsed.countryCallingCode, parsed.nationalNumber), e164: '', valid: false, country: code };
      }
    }
    const dial = dialFor(code);
    const rest = digits.replace(/^0+/, '');
    // Without the library (it failed to load) fall back to the server's own rule.
    const total = dial.length + rest.length;
    const valid = !loaded && failed && Boolean(dial) && total >= 7 && total <= 15;
    return { value: shape(dial, rest), e164: valid ? `+${dial}${rest}` : '', valid, country: code };
  }, [dialFor, failed, loaded, parse, valueFormat]);

  const status = useMemo(() => evaluate(national, country), [evaluate, national, country]);

  const emit = useCallback((digits: string, code: CountryCode) => {
    const next = evaluate(digits, code);
    lastEmitted.current = next.value;
    onChange(next);
  }, [evaluate, onChange]);

  // Take an incoming value (stored settings, or the parent resetting the form) apart into
  // country + national digits, and report it back so the parent knows whether it is valid.
  // Values the field emitted itself are ignored.
  useEffect(() => {
    if (value === lastEmitted.current) return;
    if (!value.trim()) {
      setNational('');
      setDraft(null);
      return;
    }
    if (!loaded) return;
    const trimmed = value.trim();
    // Stored numbers are "+971 58 514 1770" or digits with the country code ("971585141770");
    // older ones may have been saved without it ("058 514 1770").
    const international = parse(trimmed.startsWith('+') ? trimmed : `+${trimmed.replace(/\D/g, '')}`);
    const local = international?.isValid() ? undefined : parse(trimmed, country);
    const parsed = local?.isValid() ? local : international;
    let code = country;
    let digits = trimmed.replace(/\D/g, '');
    if (parsed) {
      code = parsed.country ?? (loaded.metadata.country_calling_codes[parsed.countryCallingCode]?.[0] as CountryCode | undefined) ?? country;
      digits = parsed.nationalNumber;
    }
    setCountry(code);
    setNational(digits);
    setDraft(null);
    emit(digits, code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, loaded]);

  // When the library arrives after the user already typed, report the now-validated value.
  useEffect(() => {
    if (loaded && national && draft === null && lastEmitted.current !== null && lastEmitted.current === value) emit(national, country);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const display = useMemo(() => {
    if (draft !== null) return draft;
    if (!national) return '';
    if (!loaded) return national;
    // Numbers typed with the trunk prefix ("050…", "020…", "8 912…") read best in national
    // style. Numbers typed without it — as people do next to a +971 picker — are grouped the
    // international way, without the "+971" the country button already shows.
    const nationalStyle = new loaded.lib.AsYouType(country, loaded.metadata).input(national);
    const parsed = parse(national, country);
    const trunkTyped = national.startsWith('0') || Boolean(parsed?.isValid() && parsed.nationalNumber.length < national.length);
    if (trunkTyped) return nationalStyle;
    const prefix = `+${dialFor(country)}`;
    const internationalStyle = new loaded.lib.AsYouType(undefined, loaded.metadata).input(`${prefix}${national}`);
    return internationalStyle.startsWith(prefix) ? internationalStyle.slice(prefix.length).trim() : nationalStyle;
  }, [draft, national, country, loaded, dialFor, parse]);

  // Keep the caret after the same digit once the number has been reformatted.
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (caretDigits.current === null || !input || document.activeElement !== input) return;
    let position = display.length;
    if (caretDigits.current === 0) position = 0;
    else {
      let seen = 0;
      for (let i = 0; i < display.length; i += 1) {
        if (/\d/.test(display[i])) seen += 1;
        if (seen === caretDigits.current) { position = i + 1; break; }
      }
    }
    input.setSelectionRange(position, position);
    caretDigits.current = null;
  }, [display, edit]);

  // --- Typing ----------------------------------------------------------------------------------

  const switchCountry = (code: CountryCode, reason: 'auto' | 'chosen') => {
    if (code === country) return;
    setCountry(code);
    if (reason === 'auto') setAnnouncement(`Country set to ${countryName(code)}, +${dialFor(code)}`);
  };

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
        switchCountry(detected, 'auto');
        setNational(rest);
        caretDigits.current = rest.length;
        setEdit((n) => n + 1);
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

    let digits = raw.replace(/\D/g, '');
    let caretAt = raw.slice(0, caret).replace(/\D/g, '').length;
    // Backspace or Delete on a space, bracket or dash removes the digit next to it instead.
    const inputType = (event.nativeEvent as InputEvent).inputType ?? '';
    if (digits === national && raw.length < display.length) {
      if (inputType === 'deleteContentBackward' && caretAt > 0) {
        digits = digits.slice(0, caretAt - 1) + digits.slice(caretAt);
        caretAt -= 1;
      } else if (inputType === 'deleteContentForward') {
        digits = digits.slice(0, caretAt) + digits.slice(caretAt + 1);
      }
    }
    digits = digits.slice(0, 17);

    let code = country;
    if (loaded && digits) {
      const dial = dialFor(country);
      const self = parse(digits, country);
      if (digits.startsWith(dial) && !self?.isValid()) {
        // "971501234567" next to +971 (the wa.me style): the country code was typed as well.
        const withCode = parse(`+${digits}`);
        if (withCode?.isValid() && withCode.countryCallingCode === dial) {
          digits = withCode.nationalNumber;
          caretAt = digits.length;
          if (withCode.country) code = withCode.country;
        }
      } else if (self?.isValid() && self.country && self.country !== country && dialFor(self.country) === dial) {
        // +1 and +7 are shared: follow the country the number belongs to (Canada, Kazakhstan…).
        code = self.country;
      }
    }

    caretDigits.current = caretAt;
    setEdit((n) => n + 1);
    switchCountry(code, 'auto');
    setNational(digits);
    emit(digits, code);
  };

  // --- Country menu ----------------------------------------------------------------------------

  // Position against the field (in a portal, above the fixed header and the floating buttons),
  // flipping up when the space below is the tighter side.
  useLayoutEffect(() => {
    if (!open) { setBox(null); return; }
    const place = () => {
      const anchor = fieldRef.current?.getBoundingClientRect();
      if (!anchor) return;
      const header = document.querySelector('body > div header, header');
      const headerBottom = header && getComputedStyle(header).position === 'fixed' ? header.getBoundingClientRect().bottom : 0;
      const searchHeight = 46;
      const gap = 8;
      const spaceBelow = window.innerHeight - anchor.bottom - gap - 12;
      const spaceAbove = anchor.top - Math.max(12, headerBottom + gap) - gap;
      const above = spaceBelow < 300 && spaceAbove > spaceBelow;
      const listHeight = Math.max(120, Math.min(256, (above ? spaceAbove : spaceBelow) - searchHeight));
      const width = Math.min(Math.max(anchor.width, 256), 384, window.innerWidth - 16);
      const left = Math.max(8, Math.min(anchor.left, window.innerWidth - width - 8));
      setBox(above
        ? { left, width, listHeight, above, bottom: window.innerHeight - anchor.top + gap }
        : { left, width, listHeight, above, top: anchor.bottom + gap });
    };
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open]);

  const openMenu = () => {
    if (failed && !loaded) load();
    setQuery('');
    const index = options.findIndex((option) => option.code === country);
    setActive(index < 0 ? 0 : index);
    setOpen(true);
  };

  const closeMenu = (focusTarget: 'button' | 'input' | 'none' = 'button') => {
    setOpen(false);
    if (focusTarget === 'button') buttonRef.current?.focus();
    if (focusTarget === 'input') inputRef.current?.focus();
  };

  const choose = (code: CountryCode) => {
    setDraft(null);
    switchCountry(code, 'chosen');
    emit(national, code);
    closeMenu('input');
  };

  useEffect(() => {
    if (!open || !box) return;
    searchRef.current?.focus({ preventScroll: true });
  }, [open, box === null]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!wrapperRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const item = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    item?.scrollIntoView({ block: 'nearest' });
  }, [active, open, box]);

  const onSearchKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive((i) => Math.min(i + 1, filtered.length - 1)); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (event.key === 'Home') { event.preventDefault(); setActive(0); }
    else if (event.key === 'End') { event.preventDefault(); setActive(filtered.length - 1); }
    else if (event.key === 'Enter') { event.preventDefault(); if (filtered[active]) choose(filtered[active].code); }
    else if (event.key === 'Escape') { event.preventDefault(); closeMenu('button'); }
    else if (event.key === 'Tab') {
      // The menu lives in a portal, so the browser's own Tab order would jump elsewhere.
      event.preventDefault();
      closeMenu(event.shiftKey ? 'button' : 'input');
    }
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

  const checkable = Boolean(loaded) || failed;
  const builtInError = !checkable
    ? ''
    : !national
      ? (required && showError ? 'Please enter your phone number.' : '')
      : status.valid
        ? ''
        : `This doesn't look like a valid ${countryName(country)} number${example ? `, e.g. ${noBreak(example)}` : ''}.`;
  const message = error || ((touched || showError) ? builtInError : '');
  const invalid = Boolean(message);
  const describedByIds = [countryId, message ? hintId : '', describedBy ?? ''].filter(Boolean).join(' ');

  const boxed = variant === 'boxed';
  const errorColour = '#b23b2e'; // 4.6:1 or better on every form background
  const wrapperClass = boxed
    ? `mt-1.5 flex items-stretch rounded-sm border bg-white text-sm transition-colors ${invalid ? 'border-[#b23b2e]' : 'border-[#202635]/20 focus-within:border-[#c97352]'}`
    : `mt-3 flex items-stretch border-b transition-colors ${invalid ? 'border-[#b23b2e]' : 'border-[#202635]/25 focus-within:border-[#c97352]'}`;
  const buttonClass = boxed
    ? 'flex shrink-0 items-center gap-1.5 rounded-l-sm px-3 py-2.5 text-sm text-[#202635] outline-none hover:bg-[#202635]/[.04] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#c97352]'
    : 'flex min-h-11 shrink-0 items-center gap-1.5 rounded-sm py-3 pr-3 text-base text-[#202635] outline-none hover:text-[#c97352] focus-visible:text-[#c97352] focus-visible:ring-2 focus-visible:ring-[#c97352] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent';
  const inputClass = boxed
    ? 'min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-[#202635]/35'
    : 'min-w-0 flex-1 bg-transparent py-3 pl-3 text-base outline-none placeholder:text-[#202635]/30';

  const menuStyle: CSSProperties | undefined = box
    ? { position: 'fixed', left: box.left, width: box.width, ...(box.above ? { bottom: box.bottom } : { top: box.top }) }
    : undefined;

  return (
    <div ref={wrapperRef} className="relative">
      <div ref={fieldRef} className={wrapperClass}>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => (open ? closeMenu('none') : openMenu())}
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
          onFocus={() => { if (failed && !loaded) load(); }}
          onBlur={() => setTouched(true)}
          placeholder={example || (country === 'AE' ? '50 123 4567' : '')}
          aria-label={ariaLabel}
          aria-invalid={invalid || undefined}
          aria-describedby={describedByIds}
          className={inputClass}
          data-testid={testId}
        />
      </div>
      <span id={countryId} className="sr-only">{`${countryName(country)}, +${dialFor(country)}`}</span>
      <span className="sr-only" aria-live="polite">{announcement}</span>

      {open && box && createPortal(
        <div
          ref={menuRef}
          style={menuStyle}
          className={`z-[70] flex overflow-hidden rounded-sm border border-[#202635]/15 bg-[#fcfaf6] shadow-[0_18px_40px_-18px_rgba(32,38,53,.45)] ${box.above ? 'flex-col' : 'flex-col'}`}
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
              onChange={(event) => { setQuery(event.target.value); setActive(0); }}
              onKeyDown={onSearchKey}
              placeholder="Search country or code"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-base outline-none placeholder:text-[#202635]/40 sm:text-sm"
              data-testid={`${testId}-search`}
            />
          </div>
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label="Countries"
            // Opening upwards, a fixed height keeps the search box from jumping while typing.
            style={box.above ? { height: box.listHeight } : { maxHeight: box.listHeight }}
            className="overflow-y-auto overscroll-contain py-1"
          >
            {filtered.map((option, index) => (
              <li
                key={option.code}
                id={`${listId}-${option.code}`}
                role="option"
                aria-selected={option.code === country}
                data-index={index}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(option.code)}
                onMouseMove={() => { if (index !== active) setActive(index); }}
                className={`flex min-h-10 cursor-pointer items-center gap-3 px-3 py-2 text-sm ${index === active ? 'bg-[#202635]/[.07] shadow-[inset_3px_0_0_#202635]' : ''} ${option.code === country ? 'font-medium text-[#202635]' : 'text-[#202635]/80'} ${!query && loaded && index === PREFERRED.length - 1 ? 'border-b border-[#202635]/10' : ''}`}
                data-testid={`${testId}-option-${option.code}`}
              >
                <Flag code={option.code} />
                <span className="min-w-0 flex-1 truncate">{option.name}</span>
                <span className="shrink-0 tabular-nums text-[#202635]/55">+{option.dial}</span>
              </li>
            ))}
          </ul>
          <p role="status" className={filtered.length ? 'sr-only' : 'px-3 py-3 text-sm text-[#202635]/60'}>
            {filtered.length ? (query ? `${filtered.length} ${filtered.length === 1 ? 'country' : 'countries'} found` : '') : `No country matches “${query}”.`}
          </p>
        </div>,
        document.body,
      )}

      {message && (
        <p id={hintId} className="mt-1.5 text-xs" style={{ color: errorColour }} data-testid={`${testId}-error`}>
          {message}
        </p>
      )}
    </div>
  );
}
