import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { TextSnippetRow } from "./types";
import { snippetMatchesSection } from "./types";
import "./snippet-trigger.css";

export function SnippetTriggerDropdown({
  snippets,
  noteSection,
  anchorRect,
  onSelect,
  onClose,
}: {
  snippets: TextSnippetRow[];
  noteSection: string;
  anchorRect: DOMRect;
  onSelect: (snippet: TextSnippetRow) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState<string | null>(null);

  const sectionSnippets = useMemo(
    () => snippets.filter((snippet) => snippetMatchesSection(snippet, noteSection)),
    [snippets, noteSection],
  );

  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const groupMap = useMemo(() => {
    const map = new Map<string, TextSnippetRow[]>();
    sectionSnippets.forEach((snippet) => {
      const groups = snippet.groupName
        ? snippet.groupName
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean)
        : [];
      const keys = groups.length ? groups : ["Other"];
      keys.forEach((key) => {
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(snippet);
      });
    });
    return map;
  }, [sectionSnippets]);

  const groups = useMemo(() => Array.from(groupMap.keys()).sort(), [groupMap]);
  const lower = search.toLowerCase();
  const visibleGroups = groups.filter((name) => name.toLowerCase().includes(lower));
  const visibleSnippets = group
    ? (groupMap.get(group) || []).filter((snippet) => snippet.phrase.toLowerCase().includes(lower))
    : [];
  const isEmpty = group ? visibleSnippets.length === 0 : visibleGroups.length === 0;

  return createPortal(
    <div
      className="vn-snippet-dropdown"
      ref={ref}
      style={{ top: anchorRect.bottom + 6, left: Math.min(anchorRect.left, window.innerWidth - 340) }}
    >
      <div className="vn-snippet-search">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="7.3" cy="7.3" r="5.3" stroke="#9CA3AF" strokeWidth="1.5" />
          <path d="M14 14L11.1 11.1" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          autoFocus
          className="vn-snippet-search-input"
          placeholder="Search snippets..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {group && (
        <button
          className="vn-snippet-back"
          type="button"
          onClick={() => {
            setGroup(null);
            setSearch("");
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 3L5 7L9 11" stroke="#374151" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {group}
        </button>
      )}

      <div className="vn-snippet-chips">
        {!group &&
          visibleGroups.map((name) => (
            <button
              key={name}
              type="button"
              className="vn-snippet-chip"
              title={name}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setGroup(name);
                setSearch("");
              }}
            >
              {name}
            </button>
          ))}
        {group &&
          visibleSnippets.map((snippet) => (
            <button
              key={snippet.id}
              type="button"
              className="vn-snippet-chip"
              title={snippet.phrase}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onSelect(snippet)}
            >
              {snippet.phrase}
            </button>
          ))}
        {isEmpty && <span className="vn-snippet-empty">No snippets found</span>}
      </div>
    </div>,
    document.body,
  );
}
