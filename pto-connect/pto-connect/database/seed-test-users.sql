-- Test Users Seed Data for PTO Connect
-- This file creates test users in the users table
-- Note: Supabase Auth users must be created separately via the Supabase dashboard or API

-- Insert test users into the users table
-- These should correspond to users created in Supabase Auth

INSERT INTO users (email, full_name, role) VALUES
('admin@sunsetpto.com', 'Admin User', 'admin'),
('board@sunsetpto.com', 'Board Member', 'board'),
('committee@sunsetpto.com', 'Committee Lead', 'committee'),
('volunteer@sunsetpto.com', 'Volunteer User', 'volunteer'),
('parent@sunsetpto.com', 'Parent Member', 'parent'),
('teacher@sunsetpto.com', 'Teacher User', 'teacher'),
('admin@oakwoodpto.com', 'Oakwood Admin', 'admin'),
('parent@oakwoodpto.com', 'Oakwood Parent', 'parent')
ON CONFLICT (email) DO NOTHING;

-- Insert some sample transactions for testing
INSERT INTO transactions (title, amount, type, category, date, created_by) VALUES
('Book Fair Revenue', 1250.00, 'income', 'fundraising', '2024-12-01', (SELECT id FROM users WHERE email = 'admin@sunsetpto.com')),
('Teacher Supplies', -350.75, 'expense', 'supplies', '2024-12-02', (SELECT id FROM users WHERE email = 'admin@sunsetpto.com')),
('Holiday Party Decorations', -125.50, 'expense', 'events', '2024-12-03', (SELECT id FROM users WHERE email = 'committee@sunsetpto.com')),
('Membership Dues', 500.00, 'income', 'membership', '2024-12-04', (SELECT id FROM users WHERE email = 'admin@sunsetpto.com'))
ON CONFLICT DO NOTHING;

-- Insert sample events
INSERT INTO events (title, description, start_time, end_time, created_by, location, rsvp_limit, is_public) VALUES
('Winter Holiday Party', 'Annual winter celebration for families', '2024-12-20 18:00:00', '2024-12-20 20:00:00', (SELECT id FROM users WHERE email = 'committee@sunsetpto.com'), 'School Gymnasium', 100, true),
('PTO Board Meeting', 'Monthly board meeting', '2024-12-15 19:00:00', '2024-12-15 20:30:00', (SELECT id FROM users WHERE email = 'admin@sunsetpto.com'), 'Library Conference Room', 20, false),
('Spring Fundraiser Planning', 'Planning session for spring fundraiser', '2024-12-18 18:30:00', '2024-12-18 19:30:00', (SELECT id FROM users WHERE email = 'committee@sunsetpto.com'), 'Room 101', 15, false)
ON CONFLICT DO NOTHING;

-- Insert sample fundraisers
INSERT INTO fundraisers (title, description, goal, current_total, is_active, created_by) VALUES
('Spring Carnival 2025', 'Annual spring carnival fundraiser', 5000.00, 1250.00, true, (SELECT id FROM users WHERE email = 'admin@sunsetpto.com')),
('Teacher Appreciation Fund', 'Fund to support teacher appreciation activities', 1000.00, 350.00, true, (SELECT id FROM users WHERE email = 'committee@sunsetpto.com'))
ON CONFLICT DO NOTHING;

-- Insert sample teacher requests
INSERT INTO teacher_requests (teacher_id, title, description, status) VALUES
((SELECT id FROM users WHERE email = 'teacher@sunsetpto.com'), 'Classroom Art Supplies', 'Need art supplies for upcoming project', 'pending'),
((SELECT id FROM users WHERE email = 'teacher@sunsetpto.com'), 'Field Trip Transportation', 'Bus funding for science museum trip', 'approved')
ON CONFLICT DO NOTHING;

-- Insert sample documents
INSERT INTO documents (title, category, url, uploaded_by) VALUES
('PTO Bylaws 2024', 'governance', 'https://example.com/bylaws.pdf', (SELECT id FROM users WHERE email = 'admin@sunsetpto.com')),
('Budget Report Q4', 'financial', 'https://example.com/budget-q4.pdf', (SELECT id FROM users WHERE email = 'admin@sunsetpto.com')),
('Event Planning Guide', 'resources', 'https://example.com/event-guide.pdf', (SELECT id FROM users WHERE email = 'committee@sunsetpto.com'))
ON CONFLICT DO NOTHING;
