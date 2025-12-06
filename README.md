# ShopHUB - Modern E-commerce Platform

![ShopHUB Logo](/public/ShopHub.png)

ShopHUB is a full-featured e-commerce platform built by Vincent Ojiambo, offering a seamless shopping experience with a clean, responsive design using modern web technologies.

## 🚀 Features

- **User Authentication**
  - Secure signup and login
  - Password reset functionality
  - Social login integration

- **Product Management**
  - Browse products by categories
  - Advanced search and filtering
  - Product details with high-quality images
  - Product reviews and ratings

- **Shopping Experience**
  - Add/remove items to/from cart
  - Wishlist functionality
  - Secure checkout process
  - Order tracking

- **Admin Dashboard**
  - Product management (CRUD operations)
  - Order management
  - User management
  - Sales analytics

- **Responsive Design**
  - Mobile-first approach
  - Cross-browser compatibility
  - Optimized for all screen sizes

## 🛠️ Tech Stack

- **Frontend**
  - React 18 with TypeScript
  - Vite for fast development and building
  - React Router for navigation
  - Tailwind CSS for styling
  - Shadcn/ui for beautiful, accessible components
  - Redux Toolkit for state management
  - React Hook Form for forms
  - Zod for schema validation

- **Backend**
  - Supabase (PostgreSQL)
  - Supabase Auth for authentication
  - Supabase Storage for file uploads

- **Deployment**
  - Vercel (Frontend)
  - Supabase (Backend)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account (free tier available at [supabase.com](https://supabase.com))
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vincent-Ojiambo/jumia-replica-mern.git
   cd jumia-replica-mern
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The application will be available at `http://localhost:5173`

## 📂 Project Structure

```
src/
├── assets/           # Static assets (images, icons, etc.)
├── components/       # Reusable UI components
├── config/          # Application configuration
├── contexts/        # React contexts
├── hooks/           # Custom React hooks
├── integrations/    # Third-party integrations
├── lib/             # Utility functions
├── pages/           # Page components
│   ├── admin/       # Admin dashboard pages
│   ├── auth/        # Authentication pages
│   └── ...
├── services/        # API services
├── store/           # State management
├── types/           # TypeScript type definitions
└── utils/           # Helper utilities
```

## 🌟 Key Features Implementation

### Authentication
- JWT-based authentication using Supabase Auth
- Protected routes with role-based access control
- Password reset and email verification flows

### Product Management
- Product listing with infinite scroll
- Advanced filtering and sorting
- Product details with image gallery

### Shopping Cart
- Persistent cart using localStorage
- Real-time updates
- Cart summary with shipping options

### Checkout Process
- Multi-step checkout flow
- Payment integration (Stripe)
- Order confirmation and tracking

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run end-to-end tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to a GitHub/GitLab repository
2. Import the repository to Vercel
3. Add your environment variables
4. Deploy!

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```
2. Deploy the contents of the `dist` folder to your hosting provider

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Supabase](https://supabase.com/) for the amazing backend services
- [Vite](https://vitejs.dev/) for the fast development experience
- [React](https://reactjs.org/) for building user interfaces

---

Made with ❤️ by [Vincent Ojiambo](https://github.com/Vincent-Ojiambo) | [![Twitter](https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Ftwitter.com%2Fvincentojambo)](https://twitter.com/vincentojambo)
```
