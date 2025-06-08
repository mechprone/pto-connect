# Frontend Verification Prompt for Claude Sonnet 4

Copy and paste this prompt into a new Claude Sonnet 4 chat to verify the PTO Connect frontend is 100% functional post-migration:

---

## Task: PTO Connect Frontend Verification Post-Migration

I need you to help me verify that the PTO Connect frontend is 100% functional after migrating from Vercel to Railway. The migration has been completed and I need comprehensive testing before proceeding with further development.

### Current Status
- **Frontend**: Migrated to Railway at https://app.ptoconnect.com
- **Public Site**: Migrated to Railway at https://www.ptoconnect.com
- **Backend API**: Migrated to Railway at https://api.ptoconnect.com
- **Database**: Supabase (unchanged)

### What I Need You To Do

**1. Comprehensive Frontend Testing**
- Test the main application at https://app.ptoconnect.com
- Verify all pages load correctly
- Test user authentication (login/signup)
- Check API connectivity between frontend and backend
- Verify all major features are working

**2. Public Site Testing**
- Test the marketing site at https://www.ptoconnect.com
- Verify all pages and links work
- Check responsive design
- Test contact forms and CTAs

**3. Cross-Browser Compatibility**
- Use browser tools to test different viewports
- Check for console errors
- Verify performance metrics

**4. API Integration Testing**
- Test frontend-to-backend communication
- Verify authentication flows
- Check data loading and submission
- Test error handling

### Key Areas to Focus On

**Authentication & User Management**
- Login/logout functionality
- User registration
- Password reset
- Profile management

**Core PTO Features**
- Dashboard functionality
- Event management
- Budget tracking
- Communication tools
- Document management
- Teacher requests

**UI/UX Elements**
- Navigation menus
- Forms and inputs
- Modals and popups
- Responsive design
- Loading states
- Error messages

### Expected Outcomes

Please provide:
1. **Functionality Report**: What works vs what doesn't
2. **Performance Assessment**: Loading times, responsiveness
3. **Error Log**: Any console errors or broken features
4. **Recommendations**: Any issues that need immediate attention
5. **Go/No-Go Decision**: Whether the frontend is ready for continued development

### Technical Context

The frontend is a React/Vite application that was migrated from Vercel to Railway. The backend API was also migrated from Render to Railway. All environment variables and configurations have been updated for the new infrastructure.

### Project Structure
- `/pto-connect` - Main frontend app (React/Vite)
- `/pto-connect-public` - Public marketing site
- `/pto-connect-backend` - Node.js/Express API

Please be thorough in your testing and provide detailed feedback on the frontend's readiness for continued development.
