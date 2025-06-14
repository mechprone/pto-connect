
export const roleDashboardMap = {
  admin: '/dashboard/admin',
  board_member: '/dashboard/board',
  committee_lead: '/dashboard/committee',
  volunteer: '/dashboard/volunteer',
  parent_member: '/dashboard/parent',
  teacher: '/dashboard/teacher',
}

export function getDashboardRouteForRole(role) {
  return roleDashboardMap[role] || '/unauthorized'
}
