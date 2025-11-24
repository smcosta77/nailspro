// src/app/(panel)/dashboard/layout.tsx
import { SidebarDashboard } from "./_components/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SidebarDashboard>{children}</SidebarDashboard>
    </div>
  );
}
