Travora Travel Hub – Backend API

A modern backend service powering the Travora Travel Hub application.
Designed for travelers to connect, share journeys, and plan trips.
Built with production-ready technologies including Node.js, Express, Prisma, PostgreSQL, and JWT authentication.

Getting Started

1. Clone the repository

git clone https://github.com/travoravoyagers/Travora-Travel-Hub-Server.git
cd Travora-Travel-Hub-Server

2. Install dependencies

npm install

3. Create .env file

Create a .env file in the project root:

PORT=4000
DATABASE_URL="your_postgres_connection_string"
JWT_SECRET="your_super_secret_key"

4. Set up Prisma

Generate Prisma Client:

npx prisma generate


Run migrations:

npx prisma migrate dev --name init

5. Start the development server

npm run dev

Server will start on:

http://localhost:4000

API Documentation (Swagger)

Once the server is running, open:

http://localhost:4000/api/docs

📝 License

MIT License