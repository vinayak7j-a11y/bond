import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ClaimPendingConnections } from "@/components/ClaimPendingConnections";
import { CaptureReferral } from "@/components/CaptureReferral";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <ClaimPendingConnections />
      <CaptureReferral />
      <nav className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="font-display text-lg text-brass">Bond</span>
          <Link href="/dashboard" className="text-sm text-slate hover:text-bone">
            Your Bond
          </Link>
          <Link href="/dashboard/connections" className="text-sm text-slate hover:text-bone">
            Connections
          </Link>
        </div>
        <UserButton afterSignOutUrl="/" />
      </nav>
      {children}
    </div>
  );
}
