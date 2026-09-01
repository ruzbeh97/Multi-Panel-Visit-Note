import Icon from "./Icon";
import { ASSOCIATE_PROVIDER, CLINIC_ASSISTANT, PATIENT, PROVIDER } from "../data/chart";

type Priority = "Medium" | "No Priority";
type Status = "Not Started" | "Done";
type AssigneeKind = "person" | "group";

type Task = {
  id: string;
  title: string;
  assignedTo: string;
  assigneeKind: AssigneeKind;
  assignedBy: string;
  type: string;
  priority: Priority;
  status: Status;
  dueDate: string;
};

const TASKS: Task[] = [
  {
    id: "t1",
    title: "Referral",
    assignedTo: "CCDA Inbox",
    assigneeKind: "group",
    assignedBy: CLINIC_ASSISTANT,
    type: "",
    priority: "Medium",
    status: "Not Started",
    dueDate: "08/31/2026",
  },
  {
    id: "t2",
    title: "Draft medication awaiting your approval",
    assignedTo: PROVIDER.name,
    assigneeKind: "person",
    assignedBy: ASSOCIATE_PROVIDER,
    type: "",
    priority: "No Priority",
    status: "Done",
    dueDate: "02/26/2026",
  },
  {
    id: "t3",
    title: "Draft medication awaiting your approval",
    assignedTo: PROVIDER.name,
    assigneeKind: "person",
    assignedBy: CLINIC_ASSISTANT,
    type: "",
    priority: "No Priority",
    status: "Done",
    dueDate: "09/24/2026",
  },
  {
    id: "t4",
    title: `Care journey note: ${PATIENT.name}`,
    assignedTo: ASSOCIATE_PROVIDER,
    assigneeKind: "person",
    assignedBy: ASSOCIATE_PROVIDER,
    type: "Care journey note",
    priority: "No Priority",
    status: "Done",
    dueDate: "",
  },
  {
    id: "t5",
    title: "Fax transmission failed. Please review and resend.",
    assignedTo: "Admins",
    assigneeKind: "group",
    assignedBy: CLINIC_ASSISTANT,
    type: "Failed Fax",
    priority: "Medium",
    status: "Not Started",
    dueDate: "",
  },
];

function PriorityBadge({ value }: { value: Priority }) {
  if (value === "Medium") {
    return (
      <span className="inline-flex rounded-full bg-[#fff4d6] px-2.5 py-0.5 font-body text-[12px] font-medium leading-[18px] text-[#b45309]">
        Medium
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-[#f1f1f1] px-2.5 py-0.5 font-body text-[12px] font-medium leading-[18px] text-[#454545]">
      No Priority
    </span>
  );
}

function StatusBadge({ value }: { value: Status }) {
  if (value === "Done") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#e6f4ea] px-2.5 py-0.5 font-body text-[12px] font-medium leading-[18px] text-[#1a1a1a]">
        <Icon name="check_circle" size={14} className="text-[#1e8e3e]" />
        Done
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#fff4d6] px-2.5 py-0.5 font-body text-[12px] font-medium leading-[18px] text-[#1a1a1a]">
      <Icon name="radio_button_unchecked" size={14} className="text-[#f59e0b]" />
      Not Started
    </span>
  );
}

function TypeBadge({ value }: { value: string }) {
  if (!value) return <span className="font-body text-[13px] text-[#1a1a1a]">-</span>;
  return (
    <span className="inline-flex rounded-full bg-[#f1f1f1] px-2.5 py-0.5 font-body text-[12px] font-medium leading-[18px] text-[#454545]">
      {value}
    </span>
  );
}

export default function TasksPage() {
  return (
    <div className="scrollbar-thin min-h-0 min-w-0 flex-1 self-stretch overflow-y-auto bg-white">
      <div className="flex w-full flex-col px-6 py-5">
        <div className="flex w-full items-center justify-between">
          <h1 className="font-body text-[22px] font-medium leading-[28px] text-[#1a1a1a]">Tasks</h1>
          <button
            type="button"
            className="flex h-8 items-center gap-1 rounded-full bg-[#1132ee] pl-3 pr-3.5 hover:bg-[#0e28be]"
          >
            <Icon name="add" size={16} className="text-white" />
            <span className="font-body text-[13px] font-medium leading-[18px] text-white">Create Task</span>
          </button>
        </div>

        <div className="mt-4 w-full overflow-hidden rounded-lg border border-[#e6e6e6]">
          <div className="scrollbar-thin w-full overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse">
              <thead>
                <tr className="bg-[#f7f7f7] text-left">
                  <th className="w-[92px] px-3 py-2.5" />
                  <th className="px-3 py-2.5 font-body text-[13px] font-medium leading-[18px] text-[#454545]">Title</th>
                  <th className="px-3 py-2.5 font-body text-[13px] font-medium leading-[18px] text-[#454545]">
                    Assigned To
                  </th>
                  <th className="px-3 py-2.5 font-body text-[13px] font-medium leading-[18px] text-[#454545]">
                    Assigned By
                  </th>
                  <th className="px-3 py-2.5 font-body text-[13px] font-medium leading-[18px] text-[#454545]">Type</th>
                  <th className="px-3 py-2.5 font-body text-[13px] font-medium leading-[18px] text-[#454545]">
                    Priority
                  </th>
                  <th className="px-3 py-2.5 font-body text-[13px] font-medium leading-[18px] text-[#454545]">Status</th>
                  <th className="px-3 py-2.5 font-body text-[13px] font-medium leading-[18px] text-[#454545]">
                    <span className="inline-flex items-center gap-0.5">
                      Due Date
                      <Icon name="arrow_drop_down" size={16} className="text-[#454545]" />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {TASKS.map((task) => (
                  <tr key={task.id} className="border-t border-[#e6e6e6]">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5 text-[#454545]">
                        <button type="button" aria-label="Edit task" className="rounded p-0.5 hover:bg-black/5">
                          <Icon name="edit" size={16} />
                        </button>
                        <button type="button" aria-label="Delete task" className="rounded p-0.5 hover:bg-black/5">
                          <Icon name="delete" size={16} />
                        </button>
                        <button type="button" aria-label="Task history" className="rounded p-0.5 hover:bg-black/5">
                          <Icon name="history" size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-body text-[13px] font-medium leading-[18px] text-[#1a1a1a]">
                      {task.title}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1.5 font-body text-[13px] leading-[18px] text-[#1a1a1a]">
                        <Icon
                          name={task.assigneeKind === "group" ? "group" : "person"}
                          size={16}
                          className="text-[#454545]"
                        />
                        {task.assignedTo}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-body text-[13px] font-medium leading-[18px] text-[#1a1a1a]">
                      {task.assignedBy}
                    </td>
                    <td className="px-3 py-3">
                      <TypeBadge value={task.type} />
                    </td>
                    <td className="px-3 py-3">
                      <PriorityBadge value={task.priority} />
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge value={task.status} />
                    </td>
                    <td className="px-3 py-3">
                      {task.dueDate ? (
                        <span className="inline-flex items-center gap-1.5 font-body text-[13px] leading-[18px] text-[#1a1a1a]">
                          <Icon name="calendar_month" size={16} className="text-[#f48fb1]" />
                          {task.dueDate}
                        </span>
                      ) : (
                        <span className="font-body text-[13px] text-[#1a1a1a]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
