# 🏥 Clinic CRM Frontend

A modern React-based frontend for the Clinic Registration System, built with TypeScript, Ant Design, and TailwindCSS.

## 🚀 Features

- **Authentication System**: Secure login with JWT tokens and automatic refresh
- **Real-time QR Updates**: WebSocket integration for live QR code updates
- **Role-based Access**: Admin and Staff role management
- **Patient Registration**: Public registration form accessible via QR code
- **Registration Management**: View and manage patient registrations
- **User Management**: Admin-only user account management
- **Responsive Design**: Mobile-friendly interface with TailwindCSS

## 🛠 Tech Stack

- **React 19** with TypeScript
- **Ant Design** for UI components
- **TailwindCSS** for styling and responsiveness
- **Axios** with interceptors for API calls
- **Socket.io Client** for real-time updates
- **React Router** for navigation
- **Vite** for build tooling

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── QRDisplay.tsx   # QR code display component
│   ├── Layout.tsx      # Main layout wrapper
│   └── ProtectedRoute.tsx # Route protection
├── pages/              # Page components
│   ├── Login.tsx       # Staff/Admin login
│   ├── Registration.tsx # Patient registration
│   ├── Dashboard.tsx   # Main dashboard
│   ├── RegistrationManagement.tsx # Registration list
│   └── UserManagement.tsx # User management (Admin)
├── context/            # React Context
│   └── AuthContext.tsx # Authentication context
├── services/           # API services
│   └── api.ts         # Axios configuration & API calls
├── hooks/              # Custom hooks
│   └── useSocket.ts   # WebSocket hook
├── utils/              # Utility functions
│   └── token.ts       # Token management
└── types/              # TypeScript definitions
    └── index.ts        # Type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend server running on port 4000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## 🔧 Configuration

### API Configuration

The API base URL is configured in `src/services/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:4000/api';
```

### WebSocket Configuration

WebSocket connection is configured in `src/hooks/useSocket.ts`:
```typescript
const newSocket = io('http://localhost:4000');
```

## 📱 Pages & Features

### Public Pages

1. **Login Page** (`/login`)
   - Staff and Admin authentication
   - Form validation with Ant Design
   - Automatic redirect after login

2. **Registration Page** (`/register`)
   - Patient registration form
   - Accessible via QR code token
   - Form validation and submission

### Protected Pages

1. **Dashboard** (`/dashboard`)
   - Real-time QR code display
   - Connection status monitoring
   - Quick action buttons

2. **Registration Management** (`/registrations`)
   - View all patient registrations
   - Search and filter functionality
   - Date range filtering

3. **User Management** (`/users`) - Admin Only
   - Create/delete user accounts
   - Role management
   - User list with actions

## 🔐 Authentication Flow

1. **Login**: User submits credentials
2. **Token Storage**: Access and refresh tokens stored in localStorage
3. **API Calls**: Axios interceptor automatically adds auth headers
4. **Token Refresh**: Automatic refresh on 401 responses
5. **Logout**: Clear tokens and redirect to login

## 🔄 Real-time Updates

- WebSocket connection to backend
- Automatic QR code updates via `NEW_QR` event
- Connection status monitoring
- Automatic reconnection handling

## 🎨 Styling

- **Ant Design**: Pre-built components and themes
- **TailwindCSS**: Utility-first CSS for custom styling
- **Responsive Design**: Mobile-first approach
- **Custom Components**: Reusable UI components

## 🚀 Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting service

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Structure

- **Components**: Reusable UI components
- **Pages**: Route-level components
- **Services**: API and external service integration
- **Hooks**: Custom React hooks
- **Context**: Global state management
- **Utils**: Helper functions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.