import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

type CustomTemplateBuilderProps = {
  initialName?: string;
  initialContent?: string;
  onCancel: () => void;
  onSave: (template: { name: string; content: string }) => void;
};

type ToolbarButton = {
  icon?: string;
  label?: string;
  title: string;
  command: string;
  value?: string;
};

const TOOLBAR_GROUPS: ToolbarButton[][] = [
  [
    { label: "B", title: "Bold", command: "bold" },
    { label: "I", title: "Italic", command: "italic" },
    { label: "U", title: "Underline", command: "underline" },
  ],
  [
    { label: "Aa", title: "Clear formatting", command: "removeFormat" },
    { label: "H1", title: "Heading 1", command: "formatBlock", value: "h1" },
    { label: "H2", title: "Heading 2", command: "formatBlock", value: "h2" },
    { label: "H3", title: "Heading 3", command: "formatBlock", value: "h3" },
  ],
  [
    { icon: "format_align_left", title: "Align left", command: "justifyLeft" },
    { icon: "format_align_center", title: "Align center", command: "justifyCenter" },
    { icon: "format_align_right", title: "Align right", command: "justifyRight" },
    { icon: "format_list_bulleted", title: "Bulleted list", command: "insertUnorderedList" },
    { icon: "format_list_numbered", title: "Numbered list", command: "insertOrderedList" },
  ],
];

const VARIABLE_OPTIONS = [
  { label: "Patient Name", value: "{{patient_name}}" },
  { label: "Date of Birth", value: "{{date_of_birth}}" },
  { label: "Provider Name", value: "{{provider_name}}" },
  { label: "Facility Name", value: "{{facility.name}}" },
  { label: "Facility Address", value: "{{facility.address}}" },
  { label: "Facility Phone", value: "{{facility.phone}}" },
  { label: "Facility Fax", value: "{{facility.fax}}" },
  { label: "Order Date", value: "{{order_date}}" },
];

function sanitizeEditorHtml(html: string) {
  const documentNode = new DOMParser().parseFromString(html, "text/html");
  const allowed = new Set([
    "P",
    "DIV",
    "BR",
    "B",
    "STRONG",
    "I",
    "EM",
    "U",
    "H1",
    "H2",
    "H3",
    "UL",
    "OL",
    "LI",
    "SPAN",
    "TEXTAREA",
    "SELECT",
    "OPTION",
    "LABEL",
    "INPUT",
  ]);
  const allowedAttrs = new Set(["class", "placeholder", "rows", "contenteditable", "disabled", "type", "checked", "data-field"]);

  [...documentNode.body.querySelectorAll("*")].forEach((element) => {
    if (!allowed.has(element.tagName)) {
      element.replaceWith(...element.childNodes);
      return;
    }
    [...element.attributes].forEach((attribute) => {
      if (!allowedAttrs.has(attribute.name)) element.removeAttribute(attribute.name);
    });
  });

  documentNode.body.querySelectorAll("input[type='checkbox']").forEach((element) => {
    const input = element as HTMLInputElement;
    if (input.checked) input.setAttribute("checked", "");
    else input.removeAttribute("checked");
  });

  return documentNode.body.innerHTML;
}

export const TEMPLATE_FORM_CLASS =
  "[&_.tpl-section]:mb-5 [&_.tpl-field]:mb-5 [&_.tpl-heading]:mt-4 [&_.tpl-heading]:mb-2 [&_.tpl-heading]:text-[14px] [&_.tpl-heading]:font-bold [&_.tpl-heading]:underline [&_textarea]:w-full [&_textarea]:resize-none [&_textarea]:rounded-md [&_textarea]:border [&_textarea]:border-[#d0d0d0] [&_textarea]:bg-white [&_textarea]:px-3 [&_textarea]:py-2.5 [&_textarea]:font-body [&_textarea]:text-[13px] [&_textarea]:text-[#202020] [&_textarea]:placeholder:text-[#b0b0b0] [&_.tpl-vars]:flex [&_.tpl-vars]:flex-col [&_.tpl-vars]:items-start [&_.tpl-vars]:gap-1.5 [&_.tpl-chip]:inline-flex [&_.tpl-chip]:rounded-md [&_.tpl-chip]:border [&_.tpl-chip]:border-[#9bb3ff] [&_.tpl-chip]:bg-[#e8eeff] [&_.tpl-chip]:px-2 [&_.tpl-chip]:py-0.5 [&_.tpl-chip]:font-body [&_.tpl-chip]:text-[12px] [&_.tpl-chip]:text-[#1132ee] [&_.tpl-select]:relative [&_.tpl-select]:mt-3 [&_.tpl-select-label]:absolute [&_.tpl-select-label]:-top-2 [&_.tpl-select-label]:left-2.5 [&_.tpl-select-label]:z-10 [&_.tpl-select-label]:bg-white [&_.tpl-select-label]:px-1 [&_.tpl-select-label]:font-body [&_.tpl-select-label]:text-[11px] [&_.tpl-select-label]:text-[#8a8a8a] [&_.tpl-select_select]:h-11 [&_.tpl-select_select]:w-full [&_.tpl-select_select]:appearance-none [&_.tpl-select_select]:rounded-md [&_.tpl-select_select]:border [&_.tpl-select_select]:border-[#d0d0d0] [&_.tpl-select_select]:bg-white [&_.tpl-select_select]:px-3 [&_.tpl-select_select]:pr-8 [&_.tpl-select_select]:font-body [&_.tpl-select_select]:text-[13px] [&_.tpl-select_select]:text-[#202020] [&_.tpl-select]:after:pointer-events-none [&_.tpl-select]:after:absolute [&_.tpl-select]:after:right-2.5 [&_.tpl-select]:after:top-1/2 [&_.tpl-select]:after:-translate-y-1/2 [&_.tpl-select]:after:text-[11px] [&_.tpl-select]:after:text-[#666] [&_.tpl-select]:after:content-['▾'] [&_.tpl-auth]:my-3 [&_.tpl-auth_label]:flex [&_.tpl-auth_label]:items-center [&_.tpl-auth_label]:gap-2 [&_.tpl-auth_input]:size-4 [&_.tpl-auth_input]:accent-[#1132ee] [&_.tpl-auth_span]:font-body [&_.tpl-auth_span]:text-[14px] [&_.tpl-auth_span]:text-[#303030]";

export default function CustomTemplateBuilder({
  initialName = "",
  initialContent = "",
  onCancel,
  onSave,
}: CustomTemplateBuilderProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState(initialName);
  const [content, setContent] = useState(initialContent);
  const [variablesOpen, setVariablesOpen] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== initialContent) {
      editorRef.current.innerHTML = initialContent;
    }
  }, [initialContent]);

  // Rewriting the editor's HTML while typing would collapse the caret to the top,
  // so the live document is left alone and only the preview copy is sanitized.
  const syncContent = () => {
    if (!editorRef.current) return;
    setContent(sanitizeEditorHtml(editorRef.current.innerHTML));
  };

  const normalizeContent = () => {
    if (!editorRef.current) return;
    const safeContent = sanitizeEditorHtml(editorRef.current.innerHTML);
    if (safeContent !== editorRef.current.innerHTML) editorRef.current.innerHTML = safeContent;
    setContent(safeContent);
  };

  const runCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncContent();
  };

  const insertText = (value: string) => {
    editorRef.current?.focus();
    document.execCommand(
      "insertHTML",
      false,
      `<span class="tpl-chip" contenteditable="false">${value}</span>&nbsp;`,
    );
    syncContent();
    setVariablesOpen(false);
  };

  const insertLabel = (label: string) => {
    editorRef.current?.focus();
    document.execCommand("insertText", false, `${label}: `);
    syncContent();
  };

  const insertAuthCheckbox = () => {
    editorRef.current?.focus();
    document.execCommand(
      "insertHTML",
      false,
      `<div class="tpl-auth" contenteditable="false"><label><input type="checkbox" /><span>Requires Authorization</span></label></div><p><br></p>`,
    );
    syncContent();
  };

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f7f7f7]">
      <header className="flex h-11 shrink-0 items-center border-b border-[#e5e5e5] bg-white px-4">
        <h1 className="font-body text-[16px] font-medium text-[#1a1a1a]">Custom Template Builder</h1>
      </header>

      <div className="shrink-0 border-b border-[#e6e6e6] bg-white px-4 pt-2">
        <label className="block w-[240px]">
          <span className="block font-body text-[10px] text-[#666]">
            Template Name <span className="text-[#d32f2f]">*</span>
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter a name for this template"
            className="h-7 w-full border-b border-[#d9d9d9] bg-transparent font-body text-[12px] text-[#1a1a1a] placeholder:text-[#999] focus:border-[#1132ee] focus:outline-none"
          />
        </label>

        <div className="mt-1 flex min-h-9 flex-wrap items-center gap-1 border-t border-[#f0f0f0]">
          {TOOLBAR_GROUPS.map((group, groupIndex) => (
            <div key={groupIndex} className="flex items-center border-r border-[#e8e8e8] pr-1 last:border-r-0">
              {group.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  title={item.title}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => runCommand(item.command, item.value)}
                  className={`flex h-7 min-w-7 items-center justify-center rounded px-1.5 font-body text-[11px] text-[#1132ee] hover:bg-[#eef1ff] ${
                    item.label === "B" ? "font-bold" : item.label === "I" ? "italic" : item.label === "U" ? "underline" : ""
                  }`}
                >
                  {item.icon ? <Icon name={item.icon} size={16} /> : item.label}
                </button>
              ))}
            </div>
          ))}

          {["ICD-10", "CPT", "Signature"].map((label) => (
            <button
              key={label}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => insertLabel(label)}
              className="h-7 rounded px-2 font-body text-[11px] text-[#555] hover:bg-[#f1f1f1]"
            >
              {label}
            </button>
          ))}

          <div className="relative">
            <button
              type="button"
              onClick={() => setVariablesOpen((open) => !open)}
              className="flex h-7 items-center gap-1 rounded px-2 font-body text-[11px] font-medium text-[#1132ee] hover:bg-[#eef1ff]"
            >
              <Icon name="add" size={13} />
              Variables
            </button>
            {variablesOpen ? (
              <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-lg border border-[#dedede] bg-white py-1 shadow-[0_4px_14px_rgba(0,0,0,0.14)]">
                {VARIABLE_OPTIONS.map((variable) => (
                  <button
                    key={variable.value}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => insertText(variable.value)}
                    className="flex h-8 w-full items-center px-3 text-left font-body text-[12px] text-[#303030] hover:bg-[#f4f5fb]"
                  >
                    {variable.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={insertAuthCheckbox}
            className="flex h-7 items-center gap-1 rounded px-2 font-body text-[11px] font-medium text-[#1132ee] hover:bg-[#eef1ff]"
          >
            <Icon name="check_box" size={14} />
            Requires Authorization
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-0 overflow-hidden">
        <div className="flex min-w-0 flex-[1.9] justify-center overflow-auto border-r border-[#e3e3e3] bg-[#fafafa] p-3">
          <div
            ref={editorRef}
            contentEditable
            role="textbox"
            aria-label="Template content"
            aria-multiline="true"
            onInput={syncContent}
            onBlur={normalizeContent}
            onPaste={(event) => {
              event.preventDefault();
              const text = event.clipboardData.getData("text/plain");
              document.execCommand("insertText", false, text);
              syncContent();
            }}
            data-placeholder="Start building your custom order form…"
            className={`min-h-[620px] w-full max-w-[720px] bg-white p-8 font-body text-[13px] leading-6 text-[#202020] shadow-[0_0_0_1px_#e8e8e8] focus:outline-none empty:before:pointer-events-none empty:before:text-[#aaa] empty:before:content-[attr(data-placeholder)] [&_h1]:mb-3 [&_h1]:text-[24px] [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:text-[20px] [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:text-[16px] [&_h3]:font-bold [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 ${TEMPLATE_FORM_CLASS}`}
            suppressContentEditableWarning
          />
        </div>

        <aside className="flex min-w-[330px] flex-1 flex-col bg-white">
          <h2 className="h-9 border-b border-[#e6e6e6] px-3 py-2 font-body text-[13px] font-medium text-[#1a1a1a]">Preview</h2>
          <div className="flex flex-1 justify-center overflow-auto bg-[#fafafa] p-5">
            <article className="min-h-[480px] w-[330px] bg-white p-7 font-body text-[10px] leading-[18px] text-[#202020] shadow-[0_0_0_1px_#dedede]">
              {content ? (
                <div
                  className={`[&_h1]:mb-2 [&_h1]:text-[18px] [&_h1]:font-bold [&_h2]:mb-1.5 [&_h2]:text-[15px] [&_h2]:font-bold [&_h3]:mb-1 [&_h3]:text-[12px] [&_h3]:font-bold [&_ol]:list-decimal [&_ol]:pl-4 [&_ul]:list-disc [&_ul]:pl-4 ${TEMPLATE_FORM_CLASS}`}
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <p className="text-[#aaa]">Your template preview will appear here.</p>
              )}
            </article>
          </div>
        </aside>
      </div>

      <footer className="flex h-14 shrink-0 items-center justify-end gap-2 border-t border-[#e6e6e6] bg-white px-4">
        <button
          type="button"
          onClick={onCancel}
          className="h-8 rounded-full border border-[#1132ee] bg-white px-4 font-body text-[12px] font-medium text-[#1132ee]"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!name.trim()}
          onClick={() => onSave({ name: name.trim(), content })}
          className="flex h-8 items-center gap-1.5 rounded-full bg-[#1132ee] px-4 font-body text-[12px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="save" size={14} />
          Save Template
        </button>
      </footer>
    </div>
  );
}
