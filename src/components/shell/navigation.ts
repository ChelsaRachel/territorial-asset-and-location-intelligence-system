import {
  BarChart3,
  FileText,
  LayoutDashboard,
  Scale,
  ShieldCheck,
  Target,
  type LucideIcon,
} from "lucide-react";

export type AppNavHref =
  | "/"
  | "/profile"
  | "/intelligence"
  | "/assessment"
  | "/decision"
  | "/monitoring";

export interface AppNavItem {
  label: string;
  href: AppNavHref;
  icon: LucideIcon;
}

export const appNavItems: AppNavItem[] = [
  {
    label: "Command Center",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Territory Profile",
    href: "/profile",
    icon: FileText,
  },
  {
    label: "Intelligence",
    href: "/intelligence",
    icon: BarChart3,
  },
  {
    label: "Opportunity & Risk",
    href: "/assessment",
    icon: Target,
  },
  {
    label: "Investment Decision",
    href: "/decision",
    icon: Scale,
  },
  {
    label: "Monitoring",
    href: "/monitoring",
    icon: ShieldCheck,
  },
];

export function isAppNavItemActive(pathname: string, href: AppNavHref): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
