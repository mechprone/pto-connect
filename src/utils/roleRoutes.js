// Placeholder for role-based routes

const roleRoutes = {
  admin: '/dashboard/admin',
  board_member: '/dashboard/board',
  committee_lead: '/dashboard/committee',
  volunteer: '/dashboard/volunteer',
  parent_member: '/dashboard/parent',
  teacher: '/dashboard/teacher',
};

export default roleRoutes;

export const getDashboardRouteForRole = (role) => {
  return roleRoutes[role] || '/dashboard';
}; 