import {
  Activity,
  ClipboardCheck,
  LayoutDashboard,
  Scale,
  Settings2,
  ShieldAlert,
  Store,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export const navItems: NavItem[] = []

export const secondaryNavItems: NavItem[] = []

export const routeLabels: Record<string, string> = {
  '/': 'Overview',
  '/merchants': 'Merchants',
  '/verification-queue': 'Verification Queue',
  '/risk-analysis': 'Risk Analysis',
  '/compliance': 'Compliance',
  '/activity': 'Activity',
  '/settings': 'Settings',
}

export const navigation: NavItem[] = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Merchants', href: '/merchants', icon: Store },
  { label: 'Verification Queue', href: '/verification-queue', icon: ClipboardCheck },
  { label: 'Risk Analysis', href: '/risk-analysis', icon: ShieldAlert },
  { label: 'Compliance', href: '/compliance', icon: Scale },
  { label: 'Activity', href: '/activity', icon: Activity },
  { label: 'Settings', href: '/settings', icon: Settings2 },
]

export const primaryNavigation = navigation.slice(0, 6)
export const utilityNavigation = navigation.slice(6)
export const allNavigation = navigation
