//Tools
import { db } from "./db/index.js";
import { todosTable } from "./db/schema.js";
import { ilike, eq } from "drizzle-orm";
import Groq from "groq-sdk";
import readlineSync from "readline-sync";

// Validate required environment variables
if (
  !process.env.GROQ_API_KEY ||
  process.env.GROQ_API_KEY === "your-groq-api-key-here"
) {
  console.error("❌ Error: GROQ_API_KEY is not set in .env file");
  console.error("📝 Please follow these steps:");
  console.error("   1. Copy .env.example to .env");
  console.error("   2. Get your API key from https://console.groq.com/keys");
  console.error("   3. Add your API key to the .env file");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL is not set in .env file");
  console.error(
    "📝 Please ensure your .env file has the DATABASE_URL configured"
  );
  process.exit(1);
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function getAllTodos() {
  const todos = await db.select().from(todosTable);
  return todos;
}

async function createTodos(todo) {
  const [result] = await db
    .insert(todosTable)
    .values({
      todo,
    })
    .returning({
      id: todosTable.id,
    });
  return result.id;
}

async function deleteTodo(id) {
  await db.delete(todosTable).where(eq(todosTable.id, id));
}

async function searchTodo(search) {
  const todos = await db
    .select()
    .from(todosTable)
    .where(ilike(todosTable.todo, `%${search}%`));
  return todos;
}

const tools = {
  getAllTodos: getAllTodos,
  createTodo: createTodos,
  deleteTodoById: deleteTodo,
  searchTodo: searchTodo,
};

const SYSTEM_PROMPT = `
You are an AI To-Do List Assistant with START, PLAN, ACTION, Observation and Output State.
Wait for the user prompt and first PLAN using available tools.
After Planning, Take the action with appropriate tools and wait for Observation based on Action.
Once you get the observations, Return the AI response based on START prompt and observations

You can manage tasks by adding, viewing, updating, and deleting tasks.
You must strictly follow the JSON output format.

Todo DB Schema:
id: Int and Primary Key
todo: string
created_at: Date Time
updated_at: Date Time

Available tools:
1. getAllTodos(): Returns all the todos from Database
2. createTodo(todo: string): Creates a new Todo in the DB and takes todo as a string and returns the ID of created todo
3. deleteTodoById(id: number): Deleted the todo by ID given in the DB
4. searchTodo(query: string): Searches for all todos matching the query string using ilike

Example:
START
{"type": "user", "user": "Add a task for shopping groceries."}
{"type": "plan", "plan": "I will try to get more context on what user needs to shop."}
{"type": "output", "output": "Can you tell me what all items you want to shop for?"}
{"type": "user", "user": "I want to shop for milk, eggs and bread."}
{"type": "plan", "plan": "I will use createTodo to create a new Todo in DB."}
{"type": "action", "function": "createTodo", "input": "Shopping for milk, eggs and bread."}
{"type": "observation", "observation": "2"}
{"type": "output", "output": "Your todo has been added successfully!!"}
`;

const chatHistory = [];

console.log("🤖 AI To-Do Assistant Ready! Type 'exit' to quit.\n");

while (true) {
  const query = readlineSync.question(">> ");

  if (query.toLowerCase() === "exit") {
    console.log("👋 Goodbye!");
    process.exit(0);
  }

  const userMessage = {
    type: "user",
    user: query,
  };

  chatHistory.push(`User: ${JSON.stringify(userMessage)}`);

  while (true) {
    try {
      const prompt = `${SYSTEM_PROMPT}\n\nConversation History:\n${chatHistory.join(
        "\n"
      )}\n\nRespond with a JSON object following the format from the examples.`;

      const result = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 1024,
        response_format: { type: "json_object" },
      });

      const responseText = result.choices[0].message.content;

      chatHistory.push(`Assistant: ${responseText}`);

      const action = JSON.parse(responseText);

      if (action.type === "output") {
        console.log(`🤖: ${action.output}\n`);
        break;
      } else if (action.type === "plan") {
        // Just log the plan and continue
        console.log(`💭 Planning: ${action.plan}`);
      } else if (action.type === "action") {
        const fn = tools[action.function];
        if (!fn) throw new Error(`Invalid Tool Call: ${action.function}`);

        console.log(
          `🔧 Action: ${action.function}(${JSON.stringify(action.input)})`
        );
        const observation = await fn(action.input);

        const observationMessage = {
          type: "observation",
          observation: observation,
        };

        chatHistory.push(`Observation: ${JSON.stringify(observationMessage)}`);
      }
    } catch (error) {
      // Sanitize error messages to avoid exposing sensitive data
      let errorMessage = "An error occurred while processing your request.";

      if (error.message?.includes("Invalid Tool Call")) {
        errorMessage = "Invalid tool was requested.";
      } else if (
        error.message?.includes("JSON") ||
        error.name === "SyntaxError"
      ) {
        errorMessage = "Failed to parse AI response. Please try again.";
      } else if (
        error.message?.includes("API") ||
        error.message?.includes("rate limit")
      ) {
        errorMessage =
          "API service is temporarily unavailable. Please try again later.";
      } else if (
        error.message?.includes("network") ||
        error.message?.includes("fetch")
      ) {
        errorMessage = "Network error. Please check your internet connection.";
      }

      console.error(`❌ Error: ${errorMessage}\n`);

      // Log full error details only in development (not exposed to users)
      if (process.env.NODE_ENV === "development") {
        console.error("Debug details:", error);
      }

      break;
    }
  }
}
