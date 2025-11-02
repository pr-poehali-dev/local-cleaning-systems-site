CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'manager',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS price_lists (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id INTEGER;

INSERT INTO users (username, password_hash, role) 
VALUES ('admin', 'admin123', 'admin')
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, password_hash, role) 
VALUES ('manager', 'manager123', 'manager')
ON CONFLICT (username) DO NOTHING;

INSERT INTO settings (key, value) VALUES 
('youtube_url', 'https://youtube.com/@hydrolos'),
('vk_url', 'https://vk.com/hydrolos'),
('phone', '+7 (495) 123-45-67'),
('email', 'info@hydrolos.ru'),
('address', 'г. Москва, ул. Примерная, д. 123')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
