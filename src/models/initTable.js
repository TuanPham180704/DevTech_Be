import pool from "../config/db.js";

const initTables = async () => {
  try {
    console.log("Initializing DevTech Database (FINAL VERSION)...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT
      );
    `);

    await pool.query(`
      INSERT INTO roles (id, name, description)
      VALUES
        (1, 'admin', 'System administrator'),
        (2, 'manager', 'Team manager'),
        (3, 'member', 'Default user')
      ON CONFLICT (id) DO NOTHING;
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT,
        full_name VARCHAR(100),
        avatar_url TEXT,
        role_id INT NOT NULL REFERENCES roles(id),
        status VARCHAR(20) NOT NULL
          CHECK (status IN ('active','inactive','locked'))
          DEFAULT 'active',
        last_online_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invites (
        id SERIAL PRIMARY KEY,
        email VARCHAR(100) NOT NULL,
        role_id INT NOT NULL REFERENCES roles(id),
        token TEXT UNIQUE NOT NULL,
        expired_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_by INT REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (email, used)
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        expired_at TIMESTAMP NOT NULL,
        revoked BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        socket_id TEXT NOT NULL,
        connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, socket_id)
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        type VARCHAR(20) NOT NULL CHECK (type IN ('private','group')),
        name VARCHAR(100),
        created_by INT REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS conversation_members (
        conversation_id INT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_seen_at TIMESTAMP,
        PRIMARY KEY (conversation_id, user_id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id INT REFERENCES users(id) ON DELETE SET NULL,
        content TEXT,
        type VARCHAR(20) NOT NULL DEFAULT 'text',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS message_files (
        id SERIAL PRIMARY KEY,
        message_id INT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
        file_url TEXT NOT NULL,
        file_type VARCHAR(50),
        file_size INT
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        owner_id INT REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        team_id INT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL,
        PRIMARY KEY (team_id, user_id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        team_id INT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        status VARCHAR(20) NOT NULL
          CHECK (status IN ('active','archived'))
          DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        assignee_id INT REFERENCES users(id),
        status VARCHAR(20) NOT NULL
          CHECK (status IN ('todo','doing','done'))
          DEFAULT 'todo',
        priority VARCHAR(20) NOT NULL
          CHECK (priority IN ('low','medium','high'))
          DEFAULT 'medium',
        position INT DEFAULT 0,
        due_date DATE,
        created_by INT REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS task_comments (
        id SERIAL PRIMARY KEY,
        task_id INT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        content_md TEXT,
        author_id INT REFERENCES users(id),
        visibility VARCHAR(20) NOT NULL
          CHECK (visibility IN ('public','team','private'))
          DEFAULT 'public',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS document_teams (
        document_id INT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        team_id INT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
        PRIMARY KEY (document_id, team_id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS document_tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS document_tag_map (
        document_id INT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        tag_id INT NOT NULL REFERENCES document_tags(id) ON DELETE CASCADE,
        PRIMARY KEY (document_id, tag_id)
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_conversations (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id),
        context_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_messages (
        id SERIAL PRIMARY KEY,
        ai_conversation_id INT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL CHECK (role IN ('user','assistant')),
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        target TEXT,
        ip_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS api_rate_limits (
        user_id INT NOT NULL REFERENCES users(id),
        endpoint TEXT NOT NULL,
        request_count INT DEFAULT 0,
        window_start TIMESTAMP,
        PRIMARY KEY (user_id, endpoint)
      );
    `);
    await pool.query(
      `CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);`,
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);`,
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS idx_documents_visibility ON documents(visibility);`,
    );
    await pool.query(
      `CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);`,
    );

    console.log(" DevTech Database initialized successfully (FINAL).");
    process.exit(0);
  } catch (err) {
    console.error(" Init database error:", err);
    process.exit(1);
  }
};

initTables();
