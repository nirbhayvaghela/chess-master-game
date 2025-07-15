# ChessMate

ChessMate is a real-time multiplayer chess platform where users can sign up, log in, create or join game rooms, and play chess with others. It supports a waiting room system, spectator mode, and in-room chat functionality. The application is built with a robust backend and a dynamic frontend to provide a seamless gaming experience.

## Features

- **User Authentication**: Secure sign-up and login using JWT and cookies.
- **Game Rooms**: Create or join game rooms. The room creator enters a waiting room until another player joins.
- **Gameplay**: Two players compete in a match, with a 15-second countdown on the waiting screen before the game starts.
- **Spectator Mode**: Additional users joining a room become spectators, able to watch the game in real-time.
- **In-Room Chat**: All users (players and spectators) can communicate via a chat system within the game room.
- **Fast Move Processing**: Utilizes Redis for quick move storage and retrieval, ensuring low-latency gameplay.
- **Game History**: Stores game history for future reference and analysis.

## Tech Stack

### Backend

- **Node.js & Express**: Powers the server-side application and API endpoints.
- **Socket.IO**: Enables real-time, bidirectional communication for game moves and chat.
- **Redis**: Handles fast storage and retrieval of game moves and history.
- **JWT & Cookies**: Manages secure user authentication.
- **Prisma & PostgreSQL**: ORM and database for efficient data management.

### Frontend

- **React & Vite**: Provides a fast and modern frontend development environment.
- **Chess.js**: Handles chess game logic and move validation.
- **Chessboard.js**: Renders the interactive chessboard UI.
- **React Query**: Manages API integration and data fetching for a smooth user experience.

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js (v16 or higher)
- PostgreSQL
- Redis
- npm or yarn

### Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/chessmate.git
    cd chessmate
    ```

2. **Install backend dependencies**:
    ```bash
    cd backend
    npm install
    ```

3. **Install frontend dependencies**:
    ```bash
    cd ../frontend
    npm install
    ```

4. **Set up environment variables**:

   In the backend directory, create a `.env` file and add the following variables:

    ```bash
    PORT=3000
    CORS_ORIGIN="http://localhost:8080"
    NODE_ENV="development" # or "production"

    # Token secrets
    ACCESS_TOKEN_SECRET=""
    REFRESH_TOKEN_SECRET=""

    # Database connection string
    DATABASE_URL=

    # Redis connection string
    REDIS_URL=
    ```

5. **Set up the frontend environment**:

   In the frontend directory, create a `.env` file and add the following variable:

    ```bash
    VITE_BACKEND_URL=http://localhost:3000
    ```

6. **Set up the database**:
    ```bash
    cd backend
    npx prisma migrate dev
    ```

7. **Run the backend**:
    ```bash
    npm run build
    npm run dev
    ```

8. **Run the frontend**:
    ```bash
    cd ../frontend
    npm run dev
    ```
