-- Admin Kullanici
INSERT INTO users (name, email, password, role)
VALUES
('Admin User', 'admin@example.com', '123456', 'admin');

-- Normal Kullanici
INSERT INTO users (name, email, password, role)
VALUES
('Ahmet Yılmaz', 'ahmet@example.com', '123456', 'student'),
('Ayşe Demir', 'ayse@example.com', '123456', 'student');

-- Ornek Kitaplar
INSERT INTO books (title, author, category, stock)
VALUES
('Clean Code', 'Robert C. Martin', 'Software Engineering', 3),
('Introduction to Algorithms', 'CLRS', 'Computer Science', 2),
('You Don''t Know JS', 'Kyle Simpson', 'JavaScript', 4),
('Atomic Habits', 'James Clear', 'Personal Development', 1),
('Design Patterns', 'GoF', 'Software Engineering', 2),
('Deep Work', 'Cal Newport', 'Personal Development', 1);

-- Odunc Alma
INSERT INTO loans (user_id, book_id)
VALUES
(2, 1), -- Ahmet → Clean Code
(3, 4); -- Ayşe → Atomic Habits


-- Rezervsayon
INSERT INTO reservations (user_id, book_id)
VALUES
(2, 4); -- Ahmet → Atomic Habits için rezervasyon
