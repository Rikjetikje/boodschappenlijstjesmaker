import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function HeaderSearch({
  target, label, placeholder, value, onChange, onAdd, addLabel, onClear,
  inputRef, onFocus, onBlur, confirmAdd, busy, popover, popoverProps,
}) {
  const popoverRef = useRef(null);
  const hasPopover = Boolean(popover);

  useEffect(() => {
    const panel = popoverRef.current;
    if (!panel) return;

    const viewport = window.visualViewport;
    const fitPopover = () => {
      const visibleBottom = viewport ? viewport.offsetTop + viewport.height : window.innerHeight;
      const space = visibleBottom - panel.getBoundingClientRect().top - 8;
      panel.style.setProperty('--bm-search-available-space', `${Math.max(0, space)}px`);
    };

    fitPopover();
    window.addEventListener('resize', fitPopover);
    viewport?.addEventListener('resize', fitPopover);
    viewport?.addEventListener('scroll', fitPopover);
    return () => {
      window.removeEventListener('resize', fitPopover);
      viewport?.removeEventListener('resize', fitPopover);
      viewport?.removeEventListener('scroll', fitPopover);
    };
  }, [target, hasPopover]);

  if (!target) return null;

  return createPortal(
    <div className="relative" onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) onBlur?.();
    }}>
      <form
        role="search"
        className="bm-search-field flex h-11 items-center gap-2 rounded-lg pl-3"
        onSubmit={event => {
          event.preventDefault();
          if (value.trim() && !busy) onAdd();
        }}
        onKeyDown={event => {
          if (event.key !== 'Escape') return;
          event.preventDefault();
          onClear();
        }}
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0 text-slate-500"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="m21 21-4.3-4.3" />
          <circle cx="10.8" cy="10.8" r="7.2" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          aria-label={label}
          placeholder={placeholder}
          value={value}
          onChange={event => onChange(event.target.value)}
          onFocus={onFocus}
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-500"
        />
        {value.trim() && (
          <div className="flex shrink-0">
            <button type="submit" title={addLabel} aria-label={addLabel} disabled={busy}
              onMouseDown={event => event.preventDefault()}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-lg font-semibold text-emerald-800 disabled:opacity-60">
              <span aria-hidden="true">{busy ? '…' : confirmAdd ? '✓' : '+'}</span>
            </button>
            <button type="button" title="Leegmaken" aria-label="Leegmaken" onClick={onClear}
              onMouseDown={event => event.preventDefault()}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-xl text-slate-600">
              <span aria-hidden="true">×</span>
            </button>
          </div>
        )}
      </form>
      {hasPopover && (
        <div ref={popoverRef} {...popoverProps}
          className="bm-search-popover absolute inset-x-0 top-full z-30 mt-1 overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white shadow-lg">
          {popover}
        </div>
      )}
    </div>,
    target,
  );
}
