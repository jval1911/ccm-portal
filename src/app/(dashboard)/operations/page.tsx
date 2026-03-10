"use client";

import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Shield,
  Users,
  Calculator,
  BarChart3,
} from "lucide-react";
import { getOperationTasks } from "@/lib/fake-data";
import { cn } from "@/lib/utils";
import { useState } from "react";

const typeIcons: Record<string, React.ElementType> = {
  nav: BarChart3,
  filing: Shield,
  report: FileText,
  onboarding: Users,
  tax: Calculator,
};

const typeLabels: Record<string, string> = {
  nav: "NAV Reconciliation",
  filing: "Regulatory Filing",
  report: "Investor Report",
  onboarding: "LP Onboarding",
  tax: "Tax Preparation",
};

const statusConfig: Record<
  string,
  { label: string; color: string; bgColor: string; icon: React.ElementType }
> = {
  completed: {
    label: "Completed",
    color: "text-accent-green",
    bgColor: "bg-accent-green/10",
    icon: CheckCircle2,
  },
  in_progress: {
    label: "In Progress",
    color: "text-accent-blue",
    bgColor: "bg-accent-blue/10",
    icon: Clock,
  },
  requires_approval: {
    label: "Needs Approval",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    icon: AlertCircle,
  },
  pending: {
    label: "Pending",
    color: "text-muted",
    bgColor: "bg-muted/10",
    icon: Clock,
  },
};

const filters = ["all", "requires_approval", "in_progress", "pending", "completed"];

export default function OperationsPage() {
  const tasks = getOperationTasks();
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered =
    activeFilter === "all"
      ? tasks
      : tasks.filter((t) => t.status === activeFilter);

  const counts = {
    all: tasks.length,
    requires_approval: tasks.filter((t) => t.status === "requires_approval")
      .length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    pending: tasks.filter((t) => t.status === "pending").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight text-foreground">
          Operations Hub
        </h1>
        <p className="text-[15px] text-muted mt-1">
          Fund operations autopilot — approve outputs, not operate software
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Needs Approval",
            count: counts.requires_approval,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
          {
            label: "In Progress",
            count: counts.in_progress,
            color: "text-accent-blue",
            bg: "bg-accent-blue/10",
          },
          {
            label: "Pending",
            count: counts.pending,
            color: "text-muted",
            bg: "bg-muted/10",
          },
          {
            label: "Completed",
            count: counts.completed,
            color: "text-accent-green",
            bg: "bg-accent-green/10",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="ios-card-inset p-4"
          >
            <p className="text-[13px] text-muted">{s.label}</p>
            <p className={cn("text-[17px] font-bold mt-1", s.color)}>
              {s.count}
            </p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              activeFilter === f
                ? "bg-accent-blue text-white"
                : "text-muted hover:text-foreground bg-white border border-border/60 hover:bg-black/[0.02]"
            )}
          >
            {f === "all"
              ? "All"
              : f === "requires_approval"
                ? "Needs Approval"
                : f === "in_progress"
                  ? "In Progress"
                  : f.charAt(0).toUpperCase() + f.slice(1)}{" "}
            ({counts[f as keyof typeof counts]})
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {filtered.map((task) => {
          const TypeIcon = typeIcons[task.type] || FileText;
          const status = statusConfig[task.status];
          const StatusIcon = status.icon;

          return (
            <div
              key={task.id}
              className="ios-card-inset p-5 hover:bg-black/[0.02] transition-colors"
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    status.bgColor
                  )}
                >
                  <TypeIcon className={cn("w-5 h-5", status.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <p className="text-[15px] font-semibold text-foreground">
                        {task.title}
                      </p>
                      <p className="text-[13px] text-muted mt-0.5">
                        {typeLabels[task.type]}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "text-xs px-2.5 py-1 rounded-full flex items-center gap-1",
                          status.bgColor,
                          status.color
                        )}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                      {task.status === "requires_approval" && (
                        <button className="px-4 py-1.5 rounded-2xl bg-accent-blue text-white text-[13px] font-semibold hover:bg-accent-blue/90 transition-colors">
                          Review & Approve
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[15px] text-muted mt-2">{task.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-[13px] text-muted">
                    <span>Due: {task.dueDate}</span>
                    {task.completedDate && (
                      <span>Completed: {task.completedDate}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
