-- Fix admin user role
-- Update admin@sunsetpto.com from parent_member to admin role

UPDATE profiles 
SET role = 'admin'
WHERE id = 'a7937b50-272e-4d48-a0909aeb66ab'
AND email = 'admin@sunsetpto.com';

-- Verify the update
SELECT id, email, role, first_name, last_name, org_id
FROM profiles 
WHERE id = 'a7937b50-272e-4d48-a0909aeb66ab';
