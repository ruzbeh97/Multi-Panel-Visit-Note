import { useEffect, useState } from "react";

export const USER_GROUPS_STORAGE_KEY = "prior-auth:pref-user-groups";
export const USER_GROUPS_EVENT = "prior-auth:user-groups";

export interface AssigneeGroup {
  id: string;
  name: string;
  members: string[];
}

/** Mirrors the groups the Prior Auth Tracker seeds into storage. */
const DEFAULT_ASSIGNEE_GROUPS: AssigneeGroup[] = [
  { id: "group-mri", name: "MRI Authorization Team", members: ["Bailey Moon", "Ashton Lee", "James Harden"] },
  { id: "group-visco", name: "Visco Authorization Team", members: ["Molly Harden", "James Franco"] },
  { id: "group-dme", name: "DME Authorization Team", members: ["James Franco", "Natasha Smith", "Ronald Regin"] },
  { id: "group-referral", name: "Referral Authorization Group", members: ["Olivia Grace", "Leo Wood", "Ava Brooks"] },
  { id: "group-medication", name: "Medication Authorization Team", members: ["Brad Hope", "Sophia Sun", "Natasha Smith"] },
  { id: "group-lab", name: "Lab Authorization Group", members: ["Ethan Sky", "Noah Rain", "Caleb Stone"] },
  { id: "group-front-desk", name: "Front Desk Group", members: ["Piper West", "Hazel Cloud", "Gavin Lake", "Violet Ash"] },
];

export function loadAssigneeGroups(): AssigneeGroup[] {
  try {
    const saved = localStorage.getItem(USER_GROUPS_STORAGE_KEY);
    if (!saved) return DEFAULT_ASSIGNEE_GROUPS;
    const parsed = JSON.parse(saved) as Array<Partial<AssigneeGroup>>;
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_ASSIGNEE_GROUPS;
    return parsed
      .filter((group): group is AssigneeGroup => Boolean(group?.name))
      .map((group) => ({
        id: group.id || group.name,
        name: group.name,
        members: Array.isArray(group.members) ? group.members.filter(Boolean) : [],
      }));
  } catch {
    return DEFAULT_ASSIGNEE_GROUPS;
  }
}

export function loadAssigneeGroupNames(): string[] {
  return [...new Set(loadAssigneeGroups().map((group) => group.name))];
}

function useStorageBacked<T>(read: () => T): T {
  const [value, setValue] = useState(read);

  useEffect(() => {
    const refresh = () => setValue(read());
    window.addEventListener(USER_GROUPS_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(USER_GROUPS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return value;
}

export function useAssigneeGroupRecords(): AssigneeGroup[] {
  return useStorageBacked(loadAssigneeGroups);
}

export function useAssigneeGroups(): string[] {
  return useStorageBacked(loadAssigneeGroupNames);
}
