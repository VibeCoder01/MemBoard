# MemBoard

This example uses SQLite for storage instead of Firebase.

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
   (You need internet access to fetch packages.)

2. **Configure SQLite**

   The application uses a local SQLite database file. You can specify the path
   with the `SQLITE_PATH` environment variable in `.env.local`. If not set it
   defaults to `./memboard.sqlite` in the project root.

3. **Run the development server**
   ```bash
   npm run dev
   ```

To explore the code, start with `src/app/page.tsx`.

When uploading photos through the admin interface, files with identical content
are skipped (duplicates are detected using a SHA-256 hash). A toast message
shows how many photos were added and how many duplicates were ignored.
