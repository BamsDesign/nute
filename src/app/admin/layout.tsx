import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s · Administration NUTE" },
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return children;
}
