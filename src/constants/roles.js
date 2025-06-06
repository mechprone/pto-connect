export const ROLES = {
  ADMIN: 'admin',
  BOARD_MEMBER: 'board_member',
  COMMITTEE_LEAD: 'committee_lead',
  VOLUNTEER: 'volunteer',
  PARENT_MEMBER: 'parent_member',
  TEACHER: 'teacher',
}

// Role hierarchy for permissions (higher number = more permissions)
export const ROLE_HIERARCHY = {
  'teacher': 1,
  'parent_member': 2,
  'volunteer': 3,
  'committee_lead': 4,
  'board_member': 5,
  'admin': 6,
}

// Helper function to check if user has sufficient role level
export const hasMinimumRole = (userRole, requiredRole) => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

// Role display names
export const ROLE_DISPLAY_NAMES = {
  'admin': 'Administrator',
  'board_member': 'Board Member',
  'committee_lead': 'Committee Lead',
  'volunteer': 'Volunteer',
  'parent_member': 'Parent Member',
  'teacher': 'Teacher',
}
