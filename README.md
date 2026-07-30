# AI Finance

AI Finance is an intelligent financial management application powered by artificial intelligence. It helps users track transactions, manage budgets, and gain insights into their financial health through advanced AI features.

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Background Jobs**: [Inngest](https://www.inngest.com/)
- **AI Integration**: [Google Gemini AI](https://ai.google.dev/)

---

## Local Setup

Follow these steps to set up the project locally on your machine.

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ai-finance.git
cd ai-finance
```

### 2. Install dependencies

Ensure you have Node.js and a package manager like `npm` or `pnpm` installed.

```bash
npm install
# or
pnpm install
```

### 3. Configure environment variables

Create a local environment file based on the provided template:

```bash
cp .env.example .env
```

Open `.env` and fill in all the required variables (Database URL, Clerk keys, Gemini AI keys, etc.) with your own credentials. See the comments in `.env.example` for where to obtain them.

### 4. Initialize the Database

Make sure your PostgreSQL instance is running and your `DATABASE_URL` is correct in `.env`. Then, generate the Prisma client and push the schema to the database:

```bash
npx prisma generate
npx prisma db push
```

*(Note: If using migrations, you can run `npx prisma migrate dev` instead.)*

---

## Running Locally

To run the application, you'll need to start both the Next.js development server and the Inngest local development server for background jobs.

### Start the Next.js App

```bash
npm run dev
# or
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Start the Inngest Dev Server

In a separate terminal window, run:

```bash
npx inngest-cli@latest dev
```

The Inngest dashboard will be available at [http://localhost:8288](http://localhost:8288).

---

## Deployment

### Hosting

This Next.js application can be easily deployed to [Vercel](https://vercel.com/), the creators of Next.js.

1. Push your code to a Git repository (GitHub, GitLab, Bitbucket).
2. Import the project into Vercel.
3. The build settings should automatically be configured for Next.js:
   - **Build Command**: `next build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install` or `pnpm install`

### Environment Variables for Production

Ensure you add all required environment variables to your hosting provider's configuration. In Vercel, you can do this under Project Settings > Environment Variables. Make sure to use production keys for your services:
- Production `DATABASE_URL`
- Live Clerk keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`)
- Gemini API Key
- Inngest specific production variables if required.

### Database Migrations in Production

For production deployments, you should use Prisma migrations instead of `db push`. You can add a `postinstall` script in your `package.json` to automatically deploy migrations during the build phase:

```json
"scripts": {
  "postinstall": "prisma generate",
  "build": "prisma migrate deploy && next build"
}
```
