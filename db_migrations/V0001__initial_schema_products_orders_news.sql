-- Таблица товаров (очистных сооружений)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    capacity INT NOT NULL, -- производительность в литрах/сутки
    image_url TEXT,
    specifications JSONB, -- технические характеристики
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица заказов
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255),
    customer_address TEXT,
    product_id INT REFERENCES products(id),
    quantity INT DEFAULT 1,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'new', -- new, processing, completed, cancelled
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица новостей
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка примерных товаров
INSERT INTO products (name, description, price, capacity, image_url, specifications) VALUES
('ЭкоЧист-3', 'Компактная система очистки для загородного дома', 125000.00, 600, '/placeholder.svg', '{"material": "Полипропилен", "dimensions": "1.2x1.2x2.0м", "weight": "180кг", "warranty": "5 лет"}'),
('БиоКлар-5', 'Автономная станция биологической очистки', 185000.00, 1000, '/placeholder.svg', '{"material": "Стеклопластик", "dimensions": "1.5x1.5x2.3м", "weight": "250кг", "warranty": "7 лет"}'),
('ГидроПро-8', 'Профессиональная система для больших объемов', 295000.00, 1500, '/placeholder.svg', '{"material": "Композит", "dimensions": "2.0x2.0x2.5м", "weight": "380кг", "warranty": "10 лет"}'),
('АквафильтрМини-2', 'Компактное решение для дачи', 89000.00, 400, '/placeholder.svg', '{"material": "Пластик", "dimensions": "0.8x0.8x1.5м", "weight": "95кг", "warranty": "3 года"}');

-- Вставка примерных новостей
INSERT INTO news (title, content, image_url) VALUES
('Новая серия очистных сооружений 2024', 'Представляем обновленную линейку станций биологической очистки с увеличенной производительностью и сниженным энергопотреблением.', '/placeholder.svg'),
('Сертификация по европейским стандартам', 'Наша продукция успешно прошла сертификацию по стандартам ЕС и получила знак качества.', '/placeholder.svg'),
('Акция на монтаж до конца месяца', 'Специальное предложение: скидка 15% на установку при заказе оборудования в текущем месяце.', '/placeholder.svg');

-- Индексы для оптимизации
CREATE INDEX idx_products_capacity ON products(capacity);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_news_published ON news(published_at DESC);