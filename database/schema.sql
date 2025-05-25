-- USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT CHECK (role IN ('admin', 'board', 'committee', 'volunteer', 'parent', 'teacher')),
    created_at TIMESTAMP DEFAULT now()
);

-- EVENTS
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    created_by UUID REFERENCES users(id),
    location TEXT,
    rsvp_limit INT,
    template_used UUID,
    is_public BOOLEAN DEFAULT FALSE
);

-- RSVPs
CREATE TABLE rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id),
    user_id UUID REFERENCES users(id),
    status TEXT CHECK (status IN ('yes', 'no', 'maybe')),
    created_at TIMESTAMP DEFAULT now()
);

-- TRANSACTIONS
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')),
    category TEXT,
    date DATE,
    created_by UUID REFERENCES users(id),
    receipt_url TEXT
);

-- FUNDRAISERS
CREATE TABLE fundraisers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    description TEXT,
    goal NUMERIC(10, 2),
    current_total NUMERIC(10, 2) DEFAULT 0,
    stripe_link TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id)
);

-- TEACHER REQUESTS
CREATE TABLE teacher_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES users(id),
    title TEXT,
    description TEXT,
    status TEXT CHECK (status IN ('pending', 'approved', 'denied')) DEFAULT 'pending',
    response TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- MESSAGES
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    body TEXT,
    send_to_role TEXT[],
    send_as TEXT CHECK (send_as IN ('email', 'sms', 'in_app'))[],
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT now()
);

-- DOCUMENT VAULT
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    category TEXT,
    url TEXT,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT now()
);
