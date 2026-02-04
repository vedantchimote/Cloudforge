-- Create additional databases for microservices
CREATE DATABASE cloudforge_orders;
CREATE DATABASE cloudforge_payments;
CREATE DATABASE cloudforge_notifications;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE cloudforge_orders TO cloudforge;
GRANT ALL PRIVILEGES ON DATABASE cloudforge_payments TO cloudforge;
GRANT ALL PRIVILEGES ON DATABASE cloudforge_notifications TO cloudforge;
