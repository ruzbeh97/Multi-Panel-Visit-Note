import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Icon from "./Icon";
import { PATIENT, PATIENT_CONTACTS, SITE_CONTACTS } from "../data/chart";

const COLUMNS = [
  "Actions",
  "Contact Type",
  "Name",
  "Description",
  "Primary Phone",
  "Secondary Phone",
  "Email",
  "Fax Number",
  "Patient",
  "Notes",
];

const TABS = [`${PATIENT.name} Contacts`, "Site-wide Contacts"];

export default function ContactBookModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState(TABS[0]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const contacts = tab === TABS[0] ? PATIENT_CONTACTS : SITE_CONTACTS;
  const term = query.trim().toLowerCase();
  const rows = term
    ? contacts.filter((contact) =>
        [contact.name, contact.type, contact.description, contact.email, contact.patient, contact.notes]
          .join(" ")
          .toLowerCase()
          .includes(term),
      )
    : contacts;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-14"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Contact Book"
        className="flex h-full max-h-[720px] w-full max-w-[1400px] flex-col overflow-hidden rounded-lg bg-white shadow-[0px_24px_64px_rgba(0,0,0,0.24)]"
      >
        <div className="flex w-full shrink-0 items-center justify-between gap-4 px-6 pt-6">
          <h2 className="font-body text-[18px] font-medium leading-[26px] text-[#1a1a1a]">Contact Book</h2>
          <button
            type="button"
            className="flex h-[34px] items-center gap-1 rounded-full bg-[#1132ee] pl-3 pr-4 font-body text-[13px] font-medium text-white hover:bg-[#0f2dd7]"
          >
            <Icon name="add" size={18} />
            Create Contact
          </button>
        </div>

        <div className="flex w-full shrink-0 items-center justify-between gap-4 px-6 pt-5">
          <div className="flex items-center gap-1.5">
            {TABS.map((label) => {
              const selected = label === tab;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setTab(label)}
                  className={`flex h-[26px] items-center rounded-full px-3 font-body text-[13px] ${
                    selected
                      ? "bg-[#f1f3fe] text-[#1132ee]"
                      : "bg-[#f2f2f2] text-[#1a1a1a] hover:bg-[#e9e9e9]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search contacts"
            className="h-[38px] w-[292px] rounded-lg border border-[#e6e6e6] px-3 font-body text-[13px] text-[#1a1a1a] outline-none placeholder:text-[#808080] focus:border-[#1132ee]"
          />
        </div>

        <div className="scrollbar-thin min-h-0 w-full flex-1 overflow-auto px-6 pt-5">
          <table className="w-full min-w-[1180px] border-collapse text-left">
            <thead>
              <tr className="border-y border-[#e6e6e6]">
                {COLUMNS.map((column) => (
                  <th
                    key={column}
                    className="whitespace-nowrap px-2 py-2.5 font-body text-[13px] font-medium text-[#1a1a1a]"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((contact) => (
                <tr key={contact.name} className="border-b border-[#e6e6e6]">
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="flex size-7 items-center justify-center rounded-full hover:bg-black/5"
                        aria-label={`Edit ${contact.name}`}
                      >
                        <Icon name="edit" size={18} className="text-[#1a1a1a]" />
                      </button>
                      <button
                        type="button"
                        className="flex size-7 items-center justify-center rounded-full hover:bg-black/5"
                        aria-label={`Delete ${contact.name}`}
                      >
                        <Icon name="delete" size={18} className="text-[#1a1a1a]" />
                      </button>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-2 py-2">
                    <span className="inline-flex h-[26px] items-center rounded-full bg-[#f2f2f2] px-2.5 font-body text-[12px] text-[#1a1a1a]">
                      {contact.type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 font-body text-[13px] text-[#1132ee]">{contact.name}</td>
                  <td className="whitespace-nowrap px-2 py-2 font-body text-[13px] text-[#1a1a1a]">
                    {contact.description}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 font-body text-[13px] text-[#1a1a1a]">
                    {contact.primaryPhone}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 font-body text-[13px] text-[#1a1a1a]">
                    {contact.secondaryPhone}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 font-body text-[13px] text-[#1a1a1a]">{contact.email}</td>
                  <td className="whitespace-nowrap px-2 py-2 font-body text-[13px] text-[#1a1a1a]">{contact.fax}</td>
                  <td className="whitespace-nowrap px-2 py-2 font-body text-[13px] text-[#1a1a1a]">{contact.patient}</td>
                  <td className="max-w-[180px] truncate px-2 py-2 font-body text-[13px] text-[#1a1a1a]">
                    {contact.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex w-full items-center justify-end gap-6 border-b border-[#e6e6e6] px-2 py-2.5">
            <div className="flex items-center gap-2">
              <span className="font-body text-[13px] text-[#1a1a1a]">Rows per page:</span>
              <button
                type="button"
                className="flex h-[26px] items-center gap-0.5 rounded border border-[#e6e6e6] pl-2 pr-1 font-body text-[13px] text-[#1a1a1a] hover:bg-black/5"
              >
                10
                <Icon name="arrow_drop_down" size={18} className="text-[#1a1a1a]" />
              </button>
            </div>
            <span className="font-body text-[13px] text-[#1a1a1a]">
              1–{rows.length} of {rows.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled
                className="flex size-7 items-center justify-center rounded-full"
                aria-label="Previous page"
              >
                <Icon name="chevron_left" size={20} className="text-[#b3b3b3]" />
              </button>
              <button
                type="button"
                disabled
                className="flex size-7 items-center justify-center rounded-full"
                aria-label="Next page"
              >
                <Icon name="chevron_right" size={20} className="text-[#b3b3b3]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
