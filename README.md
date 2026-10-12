# Milk Tracker 🥛

A minimal, clean mobile application built with **React Native (Expo, TypeScript)** and **Firebase (Auth + Cloud Firestore)** to track daily morning and evening milk purchases and automatically compute monthly milk expenses.

---

## 📱 Features

- **Auth Flow**: Email and Password authentication (Sign In & Sign Up with minimum 6 character password validation). Initial user defaults created upon registration.
- **Home Screen**:
  - Interactive **Month Calendar** with previous/next month navigation.
  - Color-coded status dots:
    - 🟢 **Green**: Bought twice (Morning > 0 and Evening > 0)
    - 🟡 **Amber**: Bought once (Only Morning or Evening > 0)
    - 🔴 **Red**: Not bought (0 L or past unconfirmed day)
  - **Dynamic Day Stepper Card**: Tap any past date or today in the calendar to edit morning and evening milk quantities (steps of 0.25 L).
  - **Strict Future Lock**: Tomorrow and future dates are locked and disabled.
  - **Yesterday Card**: Quick-look card with an **Edit** button that opens a bottom sheet to adjust yesterday's quantities.
  - **Monthly Summary Footer**: Real-time display of current month's volume and cost (`<Month> so far: X L · ₹Y`).
- **Dashboard Screen**:
  - Feed of monthly cards rendered with `@shopify/flash-list` for smooth 60fps performance.
  - Displays month name, total expense in ₹, total litres bought, rate per litre, and day-count breakdown chips (Twice / Once / None).
  - Interactive **Edit rate** link for the current month.
- **Profile Screen**:
  - Configurable default morning and evening quantities.
  - Rate configuration for the current month with past rate retention.
  - Change password with re-authentication before updating.
  - Sign out button.

---

## 🛠️ Tech Stack & Best Practices

- **Expo (React Native)** with TypeScript
- **React Navigation**: `@react-navigation/native-stack` for Auth, `@react-navigation/bottom-tabs` for Home, Dashboard, Profile
- **Firebase v9+ Modular SDK**: `firebase/auth` and `firebase/firestore`
- **Performance Guidelines (`vercel-react-native-skills`)**:
  - FlashList virtualization for large feeds
  - Pure memoized components (`React.memo`)
  - Stable callback references (`useCallback`)
  - Touch targets $\ge 44\text{px}$ with `Pressable`
  - Strict conditional rendering without falsy `&&` traps

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn
- Expo Go on your mobile device (iOS/Android) or an emulator/simulator

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install --legacy-peer-deps
```

### 3. Run Unit Tests
To run unit tests verifying business rules (date locks, status derivations, monthly totals, rate inheritance):
```bash
npm test
```

### 4. Start the Application
```bash
npx expo start
```
Scan the QR code with **Expo Go** (Android) or the Camera app (iOS) to run the application on your physical device.

---

## 🔥 Firebase Setup Guide

Follow these steps to connect your own Firebase project:

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and give it a name (e.g. `milk-tracker`).
3. Disable Google Analytics (optional) and click **Create Project**.

### Step 2: Enable Email/Password Authentication
1. In the Firebase console sidebar, navigate to **Build** > **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, click **Email/Password**.
4. Enable the **Email/Password** toggle and click **Save**.

### Step 3: Create Cloud Firestore Database
1. In the sidebar, navigate to **Build** > **Firestore Database**.
2. Click **Create database**.
3. Choose a location close to your users (e.g. `asia-south1` or `us-central1`).
4. Select **Start in production mode** and click **Create**.

### Step 4: Register Web App & Get Credentials
1. In Project Overview, click the **Web** icon (`</>`) to add an app.
2. Register app name: `milk-tracker-app`.
3. Firebase will present your configuration object with keys:
   `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`.

### Step 5: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate `.env` with your Firebase values:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Step 6: Deploy Security Rules
In the Firebase console under **Firestore Database** > **Rules**, paste the contents of [`firestore.rules`](./firestore.rules) and click **Publish**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    match /users/{userId} {
      allow read, write: if isOwner(userId);

      match /entries/{dateId} {
        allow read, write: if isOwner(userId)
          && dateId.matches('^[0-9]{4}-[0-9]{2}-[0-9]{2}$')
          && (request.resource.data.morning is number && request.resource.data.morning >= 0)
          && (request.resource.data.evening is number && request.resource.data.evening >= 0);
      }

      match /rates/{monthId} {
        allow read, write: if isOwner(userId)
          && monthId.matches('^[0-9]{4}-[0-9]{2}$')
          && (request.resource.data.ratePerLitre is number && request.resource.data.ratePerLitre >= 0);
      }
    }

    match /{document=**} {
      allow read, write: false;
    }
  }
}
```

Or deploy via Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 📂 Project Structure

```
├── firebase.ts                     # Firebase modular v9+ initialization
├── firestore.rules                 # Cloud Firestore security rules
├── .env.example                    # Environment variable template
├── App.tsx                         # App entry with SafeArea, Auth, and MilkData providers
├── __tests__/
│   ├── calculations.test.ts        # Unit tests for totals, rates, and status logic
│   └── dates.test.ts               # Unit tests for date locks and formatting
└── src/
    ├── components/
    │   ├── Calendar.tsx            # Interactive calendar with dot indicators
    │   ├── QuantityStepper.tsx     # 0.25 L stepper with >=44px touch targets
    │   ├── MonthCard.tsx           # Memoized dashboard month summary card
    │   ├── StatusChip.tsx          # Green/Amber/Red status pill chips
    │   ├── RateModal.tsx           # Bottom sheet for monthly rate setting
    │   └── YesterdayModal.tsx      # Bottom sheet for editing yesterday's entry
    ├── context/
    │   ├── AuthContext.tsx         # User authentication & session state
    │   └── MilkDataContext.tsx     # Real-time Firestore sync for entries and rates
    ├── navigation/
    │   ├── RootNavigator.tsx       # Auth gatekeeper & screen transition
    │   ├── AuthStack.tsx           # Native stack for SignIn & SignUp
    │   └── AppTabs.tsx             # Bottom tab bar (Home, Dashboard, Profile)
    ├── screens/
    │   ├── SignInScreen.tsx        # "Welcome back" authentication screen
    │   ├── SignUpScreen.tsx        # "Create account" registration screen
    │   ├── HomeScreen.tsx          # Calendar, dynamic day stepper, month summary
    │   ├── DashboardScreen.tsx     # Monthly summary cards feed
    │   └── ProfileScreen.tsx       # Default quantities, rates, password change
    ├── services/
    │   ├── auth.ts                 # Firebase Auth helper functions
    │   ├── entries.ts              # Daily entry Firestore operations
    │   ├── rates.ts                # Monthly rate Firestore operations
    │   └── user.ts                 # User profile Firestore operations
    ├── theme/
    │   └── colors.ts               # Color palette tokens matching the design
    └── utils/
        ├── calculations.ts         # Math for volumes, costs, rate fallback, status
        └── dates.ts                # Date formatting and calendar grid generation
```
