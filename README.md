# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
   (You need internet access to fetch packages.)

2. **Configure Firebase**

   Create a `.env.local` file in the project root and add your Firebase
   configuration. The expected environment variables are:

   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

   Without these values the application cannot connect to Firestore and you may
   see errors such as `SyntaxError: Unexpected end of JSON input` when the app
   tries to load messages.

3. **Run the development server**
   ```bash
   npm run dev
   ```

To explore the code, start with `src/app/page.tsx`.
