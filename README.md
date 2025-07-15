ChessMate
ChessMate is a real-time multiplayer chess platform where users can sign up, log in, create or join game rooms, and play chess with others. It supports a waiting room system, spectator mode, and in-room chat functionality. The application is built with a robust backend and a dynamic frontend to provide a seamless gaming experience.
Features

User Authentication: Secure sign-up and login using JWT and cookies.
Game Rooms: Create or join game rooms. The room creator enters a waiting room until another player joins.
Gameplay: Two players compete in a match, with a 15-second countdown on the waiting screen before the game starts.
Spectator Mode: Additional users joining a room become spectators, able to watch the game in real-time.
In-Room Chat: All users (players and spectators) can communicate via a chat system within the game room.
Fast Move Processing: Utilizes Redis for quick move storage and retrieval, ensuring low-latency gameplay.
Game History: Stores game history for future reference and analysis.

Tech Stack
Backend

Node.js & Express: Powers the server-side application and API endpoints.
Socket.IO: Enables real-time, bidirectional communication for game moves and chat.
Redis: Handles fast storage and retrieval of game moves and history.
JWT & Cookies: Manages secure user authentication.
Prisma & PostgreSQL: ORM and database for efficient data management.

Frontend

React & Vite: Provides a fast and modern frontend development environment.
Chess.js: Handles chess game logic and move validation.
Chessboard.js: Renders the interactive chessboard UI.
React Query: Manages API integration and data fetching for a smooth user experience.

Getting Started
Prerequisites

Node.js (v16 or higher)
PostgreSQL
Redis
npm or yarn

Installation

Clone the repository:
git clone https://github.com/your-username/chessmate.git
cd chessmate


Install backend dependencies:
cd backend
npm install


Install frontend dependencies:
cd ../frontend
npm install


Set up environment variables:Create a .env file in the backend directory with the following:
PORT=3000
CORS_ORIGIN="http://localhost:8080"
NODE_ENV="development" #  "production"

// Token secrets
ACCESS_TOKEN_SECRET="
REFRESH_TOKEN_SECRET=

// Database connection string
DATABASE_URL=

// Redis connection string  
REDIS_URL=

Set up the database:
cd backend
npx prisma migrate dev


Run the backend:
npm run build
npm run dev


Run the frontend:
cd ../frontend
npm run dev
