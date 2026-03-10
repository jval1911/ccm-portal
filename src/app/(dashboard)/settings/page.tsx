"use client";

import { Bell, Shield, User, Key, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] md:text-[34px] font-bold text-foreground tracking-tight">
          Settings
        </h1>
        <p className="text-muted mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="ios-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-accent-blue" />
          <h2 className="text-lg font-semibold text-foreground">Profile</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Full Name", value: "Joe Valentine" },
            { label: "Email", value: "joe@ccmcapital.com" },
            { label: "Role", value: "Fund Manager / GP" },
            { label: "Fund", value: "CCM Capital Fund I, LP" },
          ].map((field) => (
            <div key={field.label}>
              <label className="text-xs text-muted block mb-1.5">
                {field.label}
              </label>
              <input
                type="text"
                defaultValue={field.value}
                className="w-full px-4 py-2.5 rounded-xl bg-background/60 border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent-blue"
              />
            </div>
          ))}
        </div>
        <button className="mt-4 px-6 py-2.5 rounded-2xl bg-accent-blue text-white text-sm font-semibold hover:bg-accent-blue/90 transition-colors">
          Save Changes
        </button>
      </div>

      {/* Notifications */}
      <div className="ios-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-accent-blue" />
          <h2 className="text-lg font-semibold text-foreground">
            Notifications
          </h2>
        </div>
        <div className="space-y-4">
          {[
            {
              title: "Operations Alerts",
              desc: "Get notified when tasks need your approval",
              on: true,
            },
            {
              title: "Daily NAV Summary",
              desc: "Receive daily portfolio reconciliation summary",
              on: true,
            },
            {
              title: "Filing Deadlines",
              desc: "Reminders for upcoming regulatory filing deadlines",
              on: true,
            },
            {
              title: "LP Activity",
              desc: "Notifications for LP subscriptions and redemptions",
              on: false,
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-center justify-between py-2"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {item.title}
                </p>
                <p className="text-xs text-muted">{item.desc}</p>
              </div>
              <button
                className={cn(
                  "w-11 h-6 rounded-full transition-colors relative",
                  item.on ? "bg-accent-blue" : "bg-border"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform",
                    item.on ? "translate-x-5.5" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="ios-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-accent-blue" />
          <h2 className="text-lg font-semibold text-foreground">Security</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-background/60">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-muted" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Two-Factor Authentication
                </p>
                <p className="text-xs text-muted">
                  Add an extra layer of security
                </p>
              </div>
            </div>
            <button className="px-4 py-2 rounded-2xl border border-accent-blue text-accent-blue text-sm font-medium hover:bg-accent-blue/10 transition-colors">
              Enable
            </button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-background/60">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-muted" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Connected Devices
                </p>
                <p className="text-xs text-muted">
                  Manage devices with access to your account
                </p>
              </div>
            </div>
            <span className="text-sm text-muted">2 devices</span>
          </div>
        </div>
      </div>
    </div>
  );
}
