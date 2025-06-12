
-- USERS TABLE POLICIES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their profile"
ON users
FOR SELECT
USING (auth.uid() = id);

-- EVENTS TABLE POLICIES
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public events"
ON events
FOR SELECT
USING (is_public = TRUE OR created_by = auth.uid());

CREATE POLICY "Users can manage their own events"
ON events
FOR ALL
USING (created_by = auth.uid());

-- RSVPS TABLE POLICIES
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own RSVPs"
ON rsvps
FOR ALL
USING (user_id = auth.uid());

-- TRANSACTIONS TABLE POLICIES
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
ON transactions
FOR SELECT
USING (created_by = auth.uid());

CREATE POLICY "Users can insert their own transactions"
ON transactions
FOR INSERT
WITH CHECK (created_by = auth.uid());

-- FUNDRAISERS TABLE POLICIES
ALTER TABLE fundraisers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active fundraisers"
ON fundraisers
FOR SELECT
USING (is_active = TRUE OR created_by = auth.uid());

CREATE POLICY "Users can manage their own fundraisers"
ON fundraisers
FOR ALL
USING (created_by = auth.uid());

-- TEACHER REQUESTS TABLE POLICIES
ALTER TABLE teacher_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage their own requests"
ON teacher_requests
FOR ALL
USING (teacher_id = auth.uid());

-- MESSAGES TABLE POLICIES
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Message sender can manage their own messages"
ON messages
FOR ALL
USING (created_by = auth.uid());

-- DOCUMENTS TABLE POLICIES
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own documents"
ON documents
FOR ALL
USING (uploaded_by = auth.uid());
