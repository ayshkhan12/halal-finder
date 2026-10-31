# 🥙 Halal Finder

A modern web application to find halal certified restaurants and food products near you.

## Features

- 🔐 **User Authentication** - Register and login to save your favorites
- 🍽️ **Restaurant Search** - Find halal certified restaurants by country, city, cuisine, and certification body
- 🛒 **Product Search** - Discover halal certified food products by category and country
- ❤️ **Favorites** - Save your favorite restaurants and products
- 🔍 **Advanced Filtering** - Filter by location, cuisine type, certification body, and more
- 📱 **Responsive Design** - Works beautifully on desktop and mobile devices

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite (better-sqlite3)
- **Authentication**: JWT (JSON Web Tokens)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Custom CSS with modern design

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Navigate to the project directory:
   ```bash
   cd HalalFinder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser and visit:
   ```
   http://localhost:3000
   ```

### Development Mode

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Restaurants
- `GET /api/restaurants` - Get all restaurants (with filters)
- `GET /api/restaurants/:id` - Get single restaurant

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product

### Favorites (requires auth)
- `GET /api/favorites` - Get user's favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:id` - Remove from favorites

### Other
- `GET /api/locations/countries` - Get list of countries
- `GET /api/locations/cities/:country` - Get cities in a country
- `GET /api/cuisines` - Get list of cuisines
- `GET /api/categories` - Get product categories
- `GET /api/certifications` - Get certification bodies

## Sample Data

The application comes pre-populated with:
- 20+ halal restaurants across UK, USA, UAE, Malaysia, Indonesia, and South Africa
- 19+ halal certified food products in various categories
- 8 certification bodies worldwide

## Project Structure

```
HalalFinder/
├── server.js          # Main Express server
├── database.js        # SQLite database setup with sample data
├── package.json       # Dependencies and scripts
├── .env               # Environment variables
└── public/            # Frontend files
    ├── index.html     # Main HTML page
    ├── css/
    │   └── styles.css # All styling
    └── js/
        └── app.js     # Frontend JavaScript
```

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
