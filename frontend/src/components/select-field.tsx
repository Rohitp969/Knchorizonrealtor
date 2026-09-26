import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

/*
 * The search bar's dropdown.
 * A native <select> draws its list with the operating system, which ignores the site's type
 * and colours and looks out of place next to everything else. This is the same control built
 * as a listbox so the panel matches the rest of the page, with the keyboard behaviour a select
 * would have given for free: type-ahead is the one thing left out, since every list here is
 * short. The chosen value is still mirrored into a hidden input so the field posts and reads
 * back like a form control.
 *
 * The panel is rendered into the body and positioned against the button, because the hero it
 * sits in clips its own overflow and would otherwise cut the list off. It flips above the
 * button when there is more room up there.
 */

export type SelectOption = { value: string; label: string };

export function SelectField({
  label,
  value,
  options,
  placeholder,
  onChange,
  testId,
  className = '',
}: {
  label: string;
  value: string;
  options: SelectOption[];
  placeholder: string;
  onChange: (value: string) => void;
  testId: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [box, setBox] = useState<{ left: number; top: number; width: number; maxHeight: number; above: boolean } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();

  const all: SelectOption[] = [{ value: '', label: placeholder }, ...options];
  const selectedIndex = Math.max(0, all.findIndex((option) => option.value === value));
  const current = all[selectedIndex] ?? all[0];

  // Opening starts on whatever is selected, so the arrow keys carry on from there.
  useEffect(() => {
    if (open) setActive(selectedIndex);
  }, [open, selectedIndex]);

  // Position against the button, flipping up when the space below is the tighter side.
  useLayoutEffect(() => {
    if (!open) { setBox(null); return; }
    const place = () => {
      const anchor = root.current?.getBoundingClientRect();
      if (!anchor) return;
      const below = window.innerHeight - anchor.bottom - 12;
      const above = anchor.top - 12;
      const goAbove = below < 220 && above > below;
      setBox({
        left: anchor.left,
        top: goAbove ? anchor.top : anchor.bottom,
        width: anchor.width,
        maxHeight: Math.max(140, Math.min(256, goAbove ? above : below)),
        above: goAbove,
      });
    };
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!root.current?.contains(target) && !list.current?.contains(target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // Keep the highlighted row in view when the list is longer than its panel.
  useEffect(() => {
    if (open) list.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const choose = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') { setOpen(false); return; }
    if (!open && (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive((i) => Math.min(i + 1, all.length - 1)); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (event.key === 'Home') { event.preventDefault(); setActive(0); }
    else if (event.key === 'End') { event.preventDefault(); setActive(all.length - 1); }
    else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(all[active]?.value ?? ''); }
    else if (event.key === 'Tab') setOpen(false);
  };

  return (
    <div ref={root} className={`relative min-w-0 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((was) => !was)}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={label}
        data-testid={testId}
        data-value={value}
        className={`search-field flex w-full min-w-0 cursor-pointer flex-col justify-center gap-1 px-4 py-3 text-left hover:bg-[#2b3242]/[.03] focus-visible:bg-[#2b3242]/[.04] focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-[#9f7a47]/45 md:px-5 md:py-3.5 ${open ? 'bg-[#2b3242]/[.04]' : ''}`}
      >
        <span className="font-mono text-[11px] uppercase tracking-[.16em] text-[#2b3242]/60">{label}</span>
        <span className="flex items-center justify-between gap-2">
          <span className={`truncate text-sm ${value ? 'text-[#2b3242]' : 'text-[#2b3242]/70'}`}>{current.label}</span>
          <ChevronDown size={14} aria-hidden="true" className={`shrink-0 text-[#2b3242]/65 transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {open && box && createPortal(
        <ul
          ref={list}
          id={listId}
          role="listbox"
          aria-label={label}
          tabIndex={-1}
          onKeyDown={onKeyDown}
          style={{
            position: 'fixed',
            left: box.left,
            width: box.width,
            maxHeight: box.maxHeight,
            ...(box.above ? { bottom: window.innerHeight - box.top } : { top: box.top }),
          }}
          className="z-[70] overflow-y-auto rounded-xl border border-[#2b3242]/12 bg-[#fcfaf5] py-1 shadow-[0_20px_44px_-18px_rgba(43,50,66,.45)]"
        >
          {all.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value || '__all'} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  // Keep the panel open until the pointer is released on a real option.
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(option.value)}
                  onMouseEnter={() => setActive(index)}
                  data-testid={`${testId}-option-${option.value || 'all'}`}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm transition-colors ${
                    index === active ? 'bg-[#2b3242]/[.06]' : ''
                  } ${isSelected ? 'text-[#2b3242]' : 'text-[#2b3242]/75'}`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check size={13} aria-hidden="true" className="shrink-0 text-[#9f7a47]" />}
                </button>
              </li>
            );
          })}
        </ul>,
        document.body,
      )}

      <input type="hidden" name={testId.replace('select-search-', '')} value={value} readOnly />
    </div>
  );
}
