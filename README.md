<h1 align="center">Travora Travel Hub – Backend API</h1>

<p align="center">
  A modern backend service powering the Travora Travel Hub application.<br>
  Designed for travelers to connect, share journeys, and plan trips.<br>
  Built using <strong>Node.js, Express, Prisma, PostgreSQL, and JWT authentication</strong>.
</p>

<hr>

<h2>Getting Started</h2>

<h3>1. Clone the Repository</h3>

<pre>
git clone https://github.com/travoravoyagers/Travora-Travel-Hub-Server.git
cd Travora-Travel-Hub-Server
</pre>

<h3>2. Install Dependencies</h3>

<pre>
npm install
</pre>

<h3>3. Create a <code>.env</code> File</h3>

<p>Create a <code>.env</code> file in the project root and add the following:</p>

<pre>
PORT=4000
DATABASE_URL="your_postgres_connection_string"
JWT_SECRET="your_super_secret_key"
</pre>

<h3>4. Set Up Prisma</h3>

<p><strong>Generate Prisma Client:</strong></p>
<pre>
npx prisma generate
</pre>

<p><strong>Run database migrations:</strong></p>
<pre>
npx prisma migrate dev --name init
</pre>

<h3>5. Start the Development Server</h3>

<pre>
npm run dev
</pre>

<p>Server will start at:</p>

<pre>
http://localhost:4000
</pre>

<hr>

<h2>API Documentation (Swagger)</h2>

<p>Once the server is running, open:</p>

<p><strong><a href="http://localhost:4000/api/docs">http://localhost:4000/api/docs</a></strong></p>
