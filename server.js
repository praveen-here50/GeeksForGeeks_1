const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'gfg-rit-super-secret-key-2026';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        db.run(`CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            subject TEXT,
            message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            roll_number TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS event_registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_name TEXT,
            name TEXT,
            email TEXT,
            roll_number TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            department TEXT,
            year TEXT,
            skills TEXT,
            problems_solved INTEGER DEFAULT 0,
            rank INTEGER DEFAULT 0,
            gfg_link TEXT,
            leetcode_link TEXT,
            github_link TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS contests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            description TEXT,
            start_time DATETIME,
            end_time DATETIME,
            duration_minutes INTEGER,
            participants_count INTEGER DEFAULT 0
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            contest_id INTEGER,
            problem_id TEXT,
            language TEXT,
            code TEXT,
            status TEXT,
            execution_time_ms INTEGER,
            memory_mb REAL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS practice_problems (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            difficulty TEXT,
            category TEXT,
            description TEXT,
            constraints TEXT,
            input_format TEXT,
            output_format TEXT,
            sample_input TEXT,
            sample_output TEXT,
            solved_count INTEGER DEFAULT 0
        )`, () => {
            // Seed practice problems if empty
            db.get('SELECT COUNT(*) as count FROM practice_problems', (err, row) => {
                if (row && row.count === 0) {
                    const seedProblems = [
                        ['Two Sum', 'Easy', 'Arrays', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', '2 <= nums.length <= 10^4', 'Array of integers and target integer', 'Array of two indices', 'nums = [2,7,11,15], target = 9', '[0,1]'],
                        ['Reverse String', 'Easy', 'Strings', 'Write a function that reverses a string.', '1 <= s.length <= 10^5', 'Array of characters', 'Reversed array of characters', 's = ["h","e","l","l","o"]', '["o","l","l","e","h"]'],
                        ['Longest Substring', 'Medium', 'Strings', 'Find the length of the longest substring without repeating characters.', '0 <= s.length <= 5*10^4', 'A string', 'Integer representing length', 's = "abcabcbb"', '3'],
                        ['Knapsack Problem', 'Hard', 'DP', 'Given weights and values of n items, put these items in a knapsack of capacity W to get the maximum total value.', '1 <= n <= 100, 1 <= W <= 1000', 'Arrays of weights and values, and capacity', 'Max value integer', 'weights=[10,20,30], values=[60,100,120], W=50', '220']
                    ];
                    const stmt = db.prepare('INSERT INTO practice_problems (title, difficulty, category, description, constraints, input_format, output_format, sample_input, sample_output) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
                    seedProblems.forEach(p => stmt.run(p));
                    stmt.finalize();
                }
            });
        });
    }
});

app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;
    db.run('INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)', [name, email, subject, message], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Message sent successfully!', id: this.lastID });
    });
});

app.post('/api/register', (req, res) => {
    const { eventName, name, email, rollNumber } = req.body;
    db.run('INSERT INTO event_registrations (event_name, name, email, roll_number) VALUES (?, ?, ?, ?)', [eventName, name, email, rollNumber], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Registration successful!', id: this.lastID });
    });
});

app.post('/api/join', (req, res) => {
    const { name, email, rollNumber } = req.body;
    db.run('INSERT INTO members (name, email, roll_number) VALUES (?, ?, ?)', [name, email, rollNumber], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Successfully joined the club!', id: this.lastID });
    });
});

app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    const lowerText = message.toLowerCase();
    
    let response = "I'm still learning! Our coordinators are best reached via the contact form for specific questions.";
    
    if (lowerText.includes('event')) {
        response = "We have several events coming up, including CodeFest RIT and weekly coding challenges. Check the Events section!";
    } else if (lowerText.includes('resource') || lowerText.includes('learn') || lowerText.includes('dsa')) {
        response = "The Learning Resources section has top curated content for DSA and Web Dev.";
    } else if (lowerText.includes('join') || lowerText.includes('member')) {
        response = "You can apply for membership by clicking the Join Club button at the top!";
    } else if (lowerText.includes('hi') || lowerText.includes('hello')) {
        response = "Hello! Let me know if you need help finding anything on our platform.";
    }

    res.json({ response });
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, department, year } = req.body;
    
    try {
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (row) return res.status(400).json({ error: 'User already exists' });
            
            const hashedPassword = await bcrypt.hash(password, 10);
            
            db.run(
                'INSERT INTO users (name, email, password, department, year) VALUES (?, ?, ?, ?, ?)',
                [name, email, hashedPassword, department, year],
                function(err) {
                    if (err) return res.status(500).json({ error: 'Error creating user' });
                    
                    const token = jwt.sign({ id: this.lastID, email }, JWT_SECRET, { expiresIn: '24h' });
                    res.status(201).json({ 
                        message: 'User registered successfully',
                        token,
                        user: { id: this.lastID, name, email, department, year }
                    });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
        
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        res.json({
            message: 'Logged in successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                department: user.department,
                year: user.year,
                skills: user.skills,
                problems_solved: user.problems_solved,
                rank: user.rank,
                gfg_link: user.gfg_link,
                leetcode_link: user.leetcode_link,
                github_link: user.github_link
            }
        });
    });
});

// User Profile Routes
// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

app.get('/api/user/profile', authenticateToken, (req, res) => {
    db.get('SELECT id, name, email, department, year, skills, problems_solved, rank, gfg_link, leetcode_link, github_link FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    });
});

app.put('/api/user/profile', authenticateToken, (req, res) => {
    const { skills, gfg_link, leetcode_link, github_link } = req.body;
    
    db.run(
        'UPDATE users SET skills = ?, gfg_link = ?, leetcode_link = ?, github_link = ? WHERE id = ?',
        [skills, gfg_link, leetcode_link, github_link, req.user.id],
        function(err) {
            if (err) return res.status(500).json({ error: 'Error updating profile' });
            res.json({ message: 'Profile updated successfully' });
        }
    );
});

// Get user's event registrations
app.get('/api/user/events', authenticateToken, (req, res) => {
    db.all('SELECT * FROM event_registrations WHERE email = (SELECT email FROM users WHERE id = ?) ORDER BY created_at DESC LIMIT 5', [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// Contests API
app.get('/api/contests', (req, res) => {
    db.all('SELECT * FROM contests ORDER BY start_time DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.post('/api/contests/submit', authenticateToken, (req, res) => {
    const { contest_id, problem_id, language, code, status, time, memory } = req.body;
    
    db.run(
        'INSERT INTO submissions (user_id, contest_id, problem_id, language, code, status, execution_time_ms, memory_mb) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [req.user.id, contest_id, problem_id, language, code, status, time, memory],
        function(err) {
            if (err) return res.status(500).json({ error: 'Database error' });

            // If accepted, increment problems solved for user (simple logic)
            if (status === 'Accepted') {
                db.run('UPDATE users SET problems_solved = problems_solved + 1 WHERE id = ?', [req.user.id]);
            }

            res.status(201).json({ message: 'Submission recorded', id: this.lastID });
        }
    );
});

// Get user's submissions/contest participation
app.get('/api/user/submissions', authenticateToken, (req, res) => {
    db.all(`
        SELECT s.*, c.title as contest_title 
        FROM submissions s 
        LEFT JOIN contests c ON s.contest_id = c.id 
        WHERE s.user_id = ? 
        ORDER BY s.created_at DESC 
        LIMIT 10
    `, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// Practice API
app.get('/api/practice', (req, res) => {
    db.all('SELECT id, title, difficulty, category, solved_count FROM practice_problems', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.get('/api/practice/:id', (req, res) => {
    db.get('SELECT * FROM practice_problems WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!row) return res.status(404).json({ error: 'Problem not found' });
        res.json(row);
    });
});

app.get('/api/leaderboard', (req, res) => {
    db.all('SELECT name, email, department, problems_solved FROM users ORDER BY problems_solved DESC LIMIT 20', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
