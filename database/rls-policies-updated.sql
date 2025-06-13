-- Enable Row Level Security on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fundraisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's org_id
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT org_id 
    FROM profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has specific role
CREATE OR REPLACE FUNCTION user_has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user has any of the specified roles
CREATE OR REPLACE FUNCTION user_has_any_role(roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND role = ANY(roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ORGANIZATIONS policies
-- Users can only see their own organization
CREATE POLICY "Users can view their own organization" ON organizations
  FOR SELECT USING (
    id = get_user_org_id()
  );

-- Only admins can update organization settings
CREATE POLICY "Admins can update organization" ON organizations
  FOR UPDATE USING (
    id = get_user_org_id() AND user_has_role('admin')
  );

-- PROFILES policies
-- Users can view profiles in their organization
CREATE POLICY "Users can view profiles in their org" ON profiles
  FOR SELECT USING (
    org_id = get_user_org_id()
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (
    id = auth.uid()
  );

-- Admins can update any profile in their org
CREATE POLICY "Admins can update profiles in their org" ON profiles
  FOR UPDATE USING (
    org_id = get_user_org_id() AND user_has_role('admin')
  );

-- Admins can insert new profiles in their org
CREATE POLICY "Admins can insert profiles" ON profiles
  FOR INSERT WITH CHECK (
    org_id = get_user_org_id() AND user_has_role('admin')
  );

-- EVENTS policies
-- Users can view events in their organization
CREATE POLICY "Users can view events in their org" ON events
  FOR SELECT USING (
    org_id = get_user_org_id()
  );

-- Admins, board members, and committee leads can create events
CREATE POLICY "Authorized users can create events" ON events
  FOR INSERT WITH CHECK (
    org_id = get_user_org_id() AND 
    user_has_any_role(ARRAY['admin', 'board_member', 'committee_lead'])
  );

-- Event creators and admins can update events
CREATE POLICY "Event creators and admins can update events" ON events
  FOR UPDATE USING (
    org_id = get_user_org_id() AND 
    (created_by = auth.uid() OR user_has_role('admin'))
  );

-- EVENT RSVPs policies
-- Users can view RSVPs for events in their org
CREATE POLICY "Users can view RSVPs in their org" ON event_rsvps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_rsvps.event_id 
      AND events.org_id = get_user_org_id()
    )
  );

-- Users can manage their own RSVPs
CREATE POLICY "Users can manage own RSVPs" ON event_rsvps
  FOR ALL USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_rsvps.event_id 
      AND events.org_id = get_user_org_id()
    )
  );

-- TRANSACTIONS policies
-- Users can view transactions in their org
CREATE POLICY "Users can view transactions in their org" ON transactions
  FOR SELECT USING (
    org_id = get_user_org_id()
  );

-- Admins and board members can create transactions
CREATE POLICY "Authorized users can create transactions" ON transactions
  FOR INSERT WITH CHECK (
    org_id = get_user_org_id() AND 
    user_has_any_role(ARRAY['admin', 'board_member'])
  );

-- Transaction creators and admins can update transactions
CREATE POLICY "Transaction creators and admins can update" ON transactions
  FOR UPDATE USING (
    org_id = get_user_org_id() AND 
    (created_by = auth.uid() OR user_has_role('admin'))
  );

-- FUNDRAISERS policies
-- Users can view fundraisers in their org
CREATE POLICY "Users can view fundraisers in their org" ON fundraisers
  FOR SELECT USING (
    org_id = get_user_org_id()
  );

-- Admins, board members, and committee leads can create fundraisers
CREATE POLICY "Authorized users can create fundraisers" ON fundraisers
  FOR INSERT WITH CHECK (
    org_id = get_user_org_id() AND 
    user_has_any_role(ARRAY['admin', 'board_member', 'committee_lead'])
  );

-- Fundraiser creators and admins can update fundraisers
CREATE POLICY "Fundraiser creators and admins can update" ON fundraisers
  FOR UPDATE USING (
    org_id = get_user_org_id() AND 
    (created_by = auth.uid() OR user_has_role('admin'))
  );

-- DONATIONS policies (public donations don't need org restriction)
-- Anyone can view donations (for public fundraising pages)
CREATE POLICY "Anyone can view donations" ON donations
  FOR SELECT USING (true);

-- System can insert donations (from Stripe webhooks)
CREATE POLICY "System can insert donations" ON donations
  FOR INSERT WITH CHECK (true);

-- TEACHER REQUESTS policies
-- Users can view teacher requests in their org
CREATE POLICY "Users can view teacher requests in their org" ON teacher_requests
  FOR SELECT USING (
    org_id = get_user_org_id()
  );

-- Teachers can create their own requests
CREATE POLICY "Teachers can create requests" ON teacher_requests
  FOR INSERT WITH CHECK (
    org_id = get_user_org_id() AND 
    teacher_id = auth.uid() AND
    user_has_role('teacher')
  );

-- Teachers can update their own requests
CREATE POLICY "Teachers can update own requests" ON teacher_requests
  FOR UPDATE USING (
    org_id = get_user_org_id() AND 
    teacher_id = auth.uid()
  );

-- Admins can update any teacher request
CREATE POLICY "Admins can update teacher requests" ON teacher_requests
  FOR UPDATE USING (
    org_id = get_user_org_id() AND 
    user_has_role('admin')
  );

-- MESSAGES policies
-- Users can view messages in their org
CREATE POLICY "Users can view messages in their org" ON messages
  FOR SELECT USING (
    org_id = get_user_org_id()
  );

-- Admins, board members, and committee leads can create messages
CREATE POLICY "Authorized users can create messages" ON messages
  FOR INSERT WITH CHECK (
    org_id = get_user_org_id() AND 
    user_has_any_role(ARRAY['admin', 'board_member', 'committee_lead'])
  );

-- Message creators and admins can update messages
CREATE POLICY "Message creators and admins can update" ON messages
  FOR UPDATE USING (
    org_id = get_user_org_id() AND 
    (created_by = auth.uid() OR user_has_role('admin'))
  );

-- MESSAGE RECIPIENTS policies
-- Users can view their own message receipts
CREATE POLICY "Users can view own message receipts" ON message_recipients
  FOR SELECT USING (
    recipient_id = auth.uid()
  );

-- System can manage message recipients
CREATE POLICY "System can manage message recipients" ON message_recipients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM messages 
      WHERE messages.id = message_recipients.message_id 
      AND messages.org_id = get_user_org_id()
    )
  );

-- DOCUMENTS policies
-- Users can view documents they have access to
CREATE POLICY "Users can view accessible documents" ON documents
  FOR SELECT USING (
    org_id = get_user_org_id() AND
    (
      is_public = true OR
      access_roles IS NULL OR
      EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = ANY(access_roles)
      )
    )
  );

-- Admins and board members can upload documents
CREATE POLICY "Authorized users can upload documents" ON documents
  FOR INSERT WITH CHECK (
    org_id = get_user_org_id() AND 
    user_has_any_role(ARRAY['admin', 'board_member'])
  );

-- Document uploaders and admins can update documents
CREATE POLICY "Document uploaders and admins can update" ON documents
  FOR UPDATE USING (
    org_id = get_user_org_id() AND 
    (uploaded_by = auth.uid() OR user_has_role('admin'))
  );

-- SHARED TEMPLATES policies
-- Users can view templates in their org and public templates
CREATE POLICY "Users can view accessible templates" ON shared_templates
  FOR SELECT USING (
    org_id = get_user_org_id() OR is_public = true
  );

-- Users can create templates in their org
CREATE POLICY "Users can create templates" ON shared_templates
  FOR INSERT WITH CHECK (
    org_id = get_user_org_id()
  );

-- Template creators and admins can update templates
CREATE POLICY "Template creators and admins can update" ON shared_templates
  FOR UPDATE USING (
    org_id = get_user_org_id() AND 
    (created_by = auth.uid() OR user_has_role('admin'))
  );

-- NOTIFICATIONS policies
-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (
    user_id = auth.uid()
  );

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (
    user_id = auth.uid()
  );

-- System can create notifications for users in the same org
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (
    org_id = get_user_org_id()
  );
