const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

// Создаем/подключаем базу данных
const db = new Database('library.db');

// Включаем поддержку внешних ключей
db.pragma('foreign_keys = ON');

// Создаем таблицы
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    year INTEGER NOT NULL,
    genre TEXT NOT NULL,
    description TEXT,
    createdBy INTEGER NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bookId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );
`);



// Функция для хеширования пароля
function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

// Создаем тестовые данные
function initializeData() {
  try {
    // Создаем администратора
    const adminPassword = hashPassword('qwerty123');
    const insertAdmin = db.prepare('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)');
    const adminResult = insertAdmin.run('admin', 'admin@library.com', adminPassword, 'admin');

    // Создаем обычного пользователя
    const userPassword = hashPassword('qwerty123');
    const insertUser = db.prepare('INSERT OR IGNORE INTO users (username, email, password) VALUES (?, ?, ?)');
    const userResult = insertUser.run('user', 'user@library.com', userPassword);

    console.log('Пользователи созданы');

    // Получаем ID пользователей
    const admin = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
    const user = db.prepare('SELECT id FROM users WHERE username = ?').get('user');

    // Создаем 5 книг
    const books = [
      {
        title: 'Мастер и Маргарита',
        author: 'Михаил Булгаков',
        year: 1967,
        genre: 'Роман',
        description: 'Философский роман о добре и зле',
        createdBy: admin.id
      },
      {
        title: 'Преступление и наказание',
        author: 'Фёдор Достоевский',
        year: 1866,
        genre: 'Психологическая драма',
        description: 'Роман о моральных дилеммах и раскаянии',
        createdBy: user.id
      },
      {
        title: '1984',
        author: 'Джордж Оруэлл',
        year: 1949,
        genre: 'Антиутопия',
        description: 'Роман о тоталитарном обществе',
        createdBy: admin.id
      },
      {
        title: 'Гарри Поттер и философский камень',
        author: 'Джоан Роулинг',
        year: 1997,
        genre: 'Фэнтези',
        description: 'Первая книга о юном волшебнике',
        createdBy: user.id
      },
      {
        title: 'Война и мир',
        author: 'Лев Толстой',
        year: 1869,
        genre: 'Исторический роман',
        description: 'Эпопея о войне 1812 года',
        createdBy: admin.id
      }
    ];

    const insertBook = db.prepare(`
      INSERT INTO books (title, author, year, genre, description, createdBy) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const bookIds = [];
    books.forEach(book => {
      const result = insertBook.run(
        book.title, 
        book.author, 
        book.year, 
        book.genre, 
        book.description, 
        book.createdBy
      );
      bookIds.push(result.lastInsertRowid);
    });

    console.log('Книги созданы');

    // Создаем 5 отзывов
    const reviews = [
      {
        bookId: bookIds[0],
        userId: user.id,
        rating: 5,
        comment: 'Великолепная книга! Читал несколько раз.'
      },
      {
        bookId: bookIds[1],
        userId: admin.id,
        rating: 4,
        comment: 'Глубокое произведение, заставляет задуматься.'
      },
      {
        bookId: bookIds[2],
        userId: user.id,
        rating: 5,
        comment: 'Актуально и в наше время.'
      },
      {
        bookId: bookIds[3],
        userId: admin.id,
        rating: 4,
        comment: 'Отличная книга для детей и взрослых.'
      },
      {
        bookId: bookIds[4],
        userId: user.id,
        rating: 3,
        comment: 'Монументальное произведение, но тяжелое для чтения.'
      }
    ];

    const insertReview = db.prepare(`
      INSERT INTO reviews (bookId, userId, rating, comment) 
      VALUES (?, ?, ?, ?)
    `);

    reviews.forEach(review => {
      insertReview.run(
        review.bookId,
        review.userId,
        review.rating,
        review.comment
      );
    });

    console.log('Отзывы созданы');
    console.log('База данных инициализирована успешно!');

  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
  }
}

// Инициализируем данные
initializeData();

module.exports = db;