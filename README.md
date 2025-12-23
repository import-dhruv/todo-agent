# 🤖 AI To-Do List Assistant

An intelligent to-do list application powered by AI that helps you manage tasks through natural language interactions using Groq's LLaMA model.

## ✨ Features

- 🧠 **AI-Powered**: Natural language task management using Groq's LLaMA 3.3 70B model
- 💾 **Database Storage**: Persistent storage with PostgreSQL
- 🔍 **Smart Search**: Find tasks using natural language queries
- 🛠️ **CRUD Operations**: Create, Read, Update, and Delete tasks
- 🐳 **Docker Support**: Easy setup with Docker Compose

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Docker & Docker Compose
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd ai-agent-todo
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Groq API key:

   ```env
   GROQ_API_KEY=your-actual-groq-api-key
   DATABASE_URL=postgresql://admin:password@localhost:54321/postgres
   ```

4. **Start the PostgreSQL database**

   ```bash
   docker compose up -d
   ```

5. **Run database migrations**

   ```bash
   pnpm run migrate
   # or
   npm run migrate
   ```

6. **Start the application**
   ```bash
   node index.js
   ```
[![Project demo]
(https://youtu.be/ScZV5BLrwuE?si=QdpUdsuwHDBXT28s)    // Video Link

## 🔑 Getting Your Groq API Key

1. Visit [Groq Console](https://console.groq.com/)
2. Sign up or log in
3. Navigate to [API Keys](https://console.groq.com/keys)
4. Click "Create API Key"
5. Copy the key and add it to your `.env` file

### Free Tier Limits

- **14,400 requests per day**
- **30 requests per minute**
- No credit card required!

## 💬 Usage Examples

Once the application is running, you can interact with it using natural language:

```
>> Add a task to buy groceries
🤖: Your todo has been added successfully!!

>> Show me all my tasks
🤖: You have 3 tasks: ...

>> Search for shopping tasks
🤖: I found 2 tasks related to shopping: ...

>> Delete task with id 1
🤖: Task deleted successfully!

>> exit
👋 Goodbye!
```

## 📊 Database Schema

```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  todo TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🛠️ Available Scripts

- `pnpm run generate` - Generate database migrations
- `pnpm run migrate` - Run database migrations
- `pnpm run studio` - Open Drizzle Studio (database GUI)

## 🐳 Docker Commands

- **Start database**: `docker compose up -d`
- **Stop database**: `docker compose down`
- **View logs**: `docker compose logs -f`
- **Reset database**: `docker compose down -v` (⚠️ This deletes all data!)

## 🏗️ Project Structure

```
ai-agent-todo/
├── db/
│   ├── index.js          # Database connection
│   └── schema.js         # Database schema definitions
├── drizzle/              # Migration files
├── .env                  # Environment variables (DO NOT COMMIT)
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
├── docker-compose.yaml   # Docker configuration
├── drizzle.config.js     # Drizzle ORM configuration
├── index.js              # Main application entry point
├── package.json          # Project dependencies
└── test-db-connection.js # Database connection test script

```

## 🔒 Security Best Practices

- ✅ Never commit `.env` files to version control
- ✅ Use `.env.example` for sharing configuration templates
- ✅ Keep API keys and database credentials secure
- ✅ Regularly rotate API keys
- ✅ Use strong database passwords in production

## 🧪 Testing Database Connection

Before running the main application, you can test your database connection:

```bash
node test-db-connection.js
```

This will verify:

- Database connectivity
- Authentication
- Table existence

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

ISC

## 🐛 Troubleshooting

### Database Connection Issues

- Ensure Docker is running: `docker ps`
- Check if PostgreSQL container is up: `docker compose ps`
- Verify `.env` credentials match `docker-compose.yaml`

### Migration Errors

- Reset database: `docker compose down -v && docker compose up -d`
- Re-run migrations: `pnpm run migrate`

### API Rate Limits

- Groq free tier has rate limits
- Wait a minute and try again
- Consider upgrading for higher limits

## 🙏 Acknowledgments

- Powered by [Groq](https://groq.com/)
- Built with [Drizzle ORM](https://orm.drizzle.team/)
- Uses [LLaMA 3.3 70B](https://www.llama.com/) model

---

Made with ❤️ by the AI community
