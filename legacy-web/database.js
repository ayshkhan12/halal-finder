const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Simple JSON-based database
const DB_PATH = path.join(__dirname, 'data.json');

// Initialize data
let data = {
    users: [],
    certification_bodies: [],
    restaurants: [],
    products: [],
    favorites: []
};

// Load existing data or initialize with sample data
function loadData() {
    try {
        if (fs.existsSync(DB_PATH)) {
            const raw = fs.readFileSync(DB_PATH, 'utf8');
            data = JSON.parse(raw);
            return;
        }
    } catch (error) {
        console.log('Creating new database...');
    }
    
    // Initialize with sample data
    initializeSampleData();
    saveData();
}

function saveData() {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function initializeSampleData() {
    // Certification bodies
    data.certification_bodies = [
        { id: uuidv4(), name: 'Halal Food Authority (HFA)', country: 'United Kingdom', website: 'https://halalfoodauthority.com', description: 'UK-based halal certification body' },
        { id: uuidv4(), name: 'Halal Monitoring Committee (HMC)', country: 'United Kingdom', website: 'https://halalhmc.org', description: 'Independent halal certification in UK' },
        { id: uuidv4(), name: 'IFANCA', country: 'United States', website: 'https://ifanca.org', description: 'Leading halal certification in North America' },
        { id: uuidv4(), name: 'JAKIM', country: 'Malaysia', website: 'https://www.halal.gov.my', description: 'Malaysian government halal certification' },
        { id: uuidv4(), name: 'MUI - Majelis Ulama Indonesia', country: 'Indonesia', website: 'https://mui.or.id', description: 'Indonesian halal certification authority' },
        { id: uuidv4(), name: 'Emirates Authority for Standardization', country: 'United Arab Emirates', website: 'https://www.esma.gov.ae', description: 'UAE government halal certification' },
        { id: uuidv4(), name: 'SANHA', country: 'South Africa', website: 'https://sanha.co.za', description: 'South African National Halal Authority' },
        { id: uuidv4(), name: 'ISA', country: 'United States', website: 'https://isaiowa.org', description: 'US-based halal certification' },
        { id: uuidv4(), name: 'IUHK - Islamic Union of Hong Kong', country: 'Hong Kong', website: 'https://www.iuhk.org', description: 'Hong Kong halal certification authority' },
    ];

    // Restaurants (with latitude/longitude for map)
    data.restaurants = [
        // UK Restaurants
        { id: uuidv4(), name: 'Dishoom', description: 'Bombay-style Indian cuisine in a vintage setting', address: '12 Upper St Martin\'s Lane', city: 'London', country: 'United Kingdom', postal_code: 'WC2H 9FB', cuisine: 'Indian', certification_body: 'Halal Food Authority (HFA)', rating: 4.7, price_range: '££', image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400', latitude: 51.5117, longitude: -0.1275 },
        { id: uuidv4(), name: 'Lahore Kebab House', description: 'Authentic Pakistani grills and curries', address: '2-10 Umberston Street', city: 'London', country: 'United Kingdom', postal_code: 'E1 1PY', cuisine: 'Pakistani', certification_body: 'Halal Monitoring Committee (HMC)', rating: 4.5, price_range: '£', image_url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400', latitude: 51.5157, longitude: -0.0643 },
        { id: uuidv4(), name: 'Archie\'s Burgers', description: 'American-style halal burgers and shakes', address: '63-67 Oxford Street', city: 'Manchester', country: 'United Kingdom', postal_code: 'M1 6EQ', cuisine: 'American', certification_body: 'Halal Food Authority (HFA)', rating: 4.3, price_range: '££', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', latitude: 53.4808, longitude: -2.2426 },
        { id: uuidv4(), name: 'MyLahore', description: 'British Asian cuisine with a modern twist', address: '765 Wilmslow Road', city: 'Manchester', country: 'United Kingdom', postal_code: 'M20 6RN', cuisine: 'Pakistani', certification_body: 'Halal Monitoring Committee (HMC)', rating: 4.4, price_range: '££', image_url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400', latitude: 53.4285, longitude: -2.2298 },
        { id: uuidv4(), name: 'The Curry Mile Restaurant', description: 'Traditional curry house with extensive menu', address: 'Wilmslow Road', city: 'Manchester', country: 'United Kingdom', postal_code: 'M14 5TQ', cuisine: 'Indian', certification_body: 'Halal Food Authority (HFA)', rating: 4.2, price_range: '£', image_url: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=400', latitude: 53.4521, longitude: -2.2256 },
        { id: uuidv4(), name: 'Akbar\'s', description: 'Award-winning Kashmiri and Indian cuisine', address: '1276 Leeds Road', city: 'Bradford', country: 'United Kingdom', postal_code: 'BD3 8LF', cuisine: 'Indian', certification_body: 'Halal Monitoring Committee (HMC)', rating: 4.6, price_range: '££', image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', latitude: 53.8008, longitude: -1.7275 },
        { id: uuidv4(), name: 'Surya Restaurant', description: 'South Indian vegetarian and non-veg cuisine', address: '57 Hedley Road', city: 'Birmingham', country: 'United Kingdom', postal_code: 'B11 1QD', cuisine: 'Indian', certification_body: 'Halal Food Authority (HFA)', rating: 4.3, price_range: '£', image_url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400', latitude: 52.4636, longitude: -1.8654 },
        { id: uuidv4(), name: 'German Doner Kebab', description: 'Premium doner kebabs, German style', address: '125 Broad Street', city: 'Birmingham', country: 'United Kingdom', postal_code: 'B15 1AS', cuisine: 'Turkish', certification_body: 'Halal Food Authority (HFA)', rating: 4.1, price_range: '£', image_url: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400', latitude: 52.4756, longitude: -1.9115 },
        // US Restaurants
        { id: uuidv4(), name: 'Halal Guys', description: 'Famous NYC halal cart turned restaurant', address: '53rd Street & 6th Avenue', city: 'New York', country: 'United States', postal_code: '10019', cuisine: 'Middle Eastern', certification_body: 'IFANCA', rating: 4.5, price_range: '£', image_url: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=400', latitude: 40.7614, longitude: -73.9776 },
        { id: uuidv4(), name: 'Nando\'s', description: 'Peri-peri chicken specialists', address: '1150 Connecticut Avenue', city: 'Washington DC', country: 'United States', postal_code: '20036', cuisine: 'Portuguese', certification_body: 'IFANCA', rating: 4.2, price_range: '££', image_url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400', latitude: 38.9072, longitude: -77.0422 },
        { id: uuidv4(), name: 'Kabob Palace', description: 'Authentic Afghan kebabs and rice dishes', address: '2315 S Eads Street', city: 'Arlington', country: 'United States', postal_code: '22202', cuisine: 'Afghan', certification_body: 'ISA', rating: 4.6, price_range: '££', image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', latitude: 38.8555, longitude: -77.0535 },
        { id: uuidv4(), name: 'Reem\'s California', description: 'Arab bakery with modern California twist', address: '3301 E 12th Street', city: 'Oakland', country: 'United States', postal_code: '94601', cuisine: 'Middle Eastern', certification_body: 'IFANCA', rating: 4.4, price_range: '££', image_url: 'https://images.unsplash.com/photo-1509358271058-adc8fd3f16ee?w=400', latitude: 37.7749, longitude: -122.2154 },
        // UAE Restaurants
        { id: uuidv4(), name: 'Al Mahara', description: 'Seafood restaurant with stunning aquarium', address: 'Burj Al Arab', city: 'Dubai', country: 'United Arab Emirates', postal_code: '', cuisine: 'Seafood', certification_body: 'Emirates Authority for Standardization', rating: 4.8, price_range: '££££', image_url: 'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=400', latitude: 25.1412, longitude: 55.1852 },
        { id: uuidv4(), name: 'Al Fanar Restaurant', description: 'Traditional Emirati cuisine', address: 'Festival City Mall', city: 'Dubai', country: 'United Arab Emirates', postal_code: '', cuisine: 'Emirati', certification_body: 'Emirates Authority for Standardization', rating: 4.5, price_range: '££', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400', latitude: 25.2240, longitude: 55.3541 },
        { id: uuidv4(), name: 'Operation: Falafel', description: 'Modern Middle Eastern street food', address: 'JBR The Walk', city: 'Dubai', country: 'United Arab Emirates', postal_code: '', cuisine: 'Middle Eastern', certification_body: 'Emirates Authority for Standardization', rating: 4.3, price_range: '£', image_url: 'https://images.unsplash.com/photo-1593001874117-c99c800e3eb6?w=400', latitude: 25.0776, longitude: 55.1350 },
        // Malaysia Restaurants
        { id: uuidv4(), name: 'Nasi Kandar Pelita', description: 'Famous mamak restaurant chain', address: 'Jalan Ampang', city: 'Kuala Lumpur', country: 'Malaysia', postal_code: '50450', cuisine: 'Malay', certification_body: 'JAKIM', rating: 4.4, price_range: '£', image_url: 'https://images.unsplash.com/photo-1562565651-7d4948f339eb?w=400', latitude: 3.1569, longitude: 101.7154 },
        { id: uuidv4(), name: 'Village Park Restaurant', description: 'Famous for nasi lemak', address: 'Jalan SS 21/37', city: 'Petaling Jaya', country: 'Malaysia', postal_code: '47400', cuisine: 'Malay', certification_body: 'JAKIM', rating: 4.7, price_range: '£', image_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400', latitude: 3.1145, longitude: 101.6249 },
        // Indonesia
        { id: uuidv4(), name: 'Sate Khas Senayan', description: 'Premium Indonesian satay', address: 'Senayan City Mall', city: 'Jakarta', country: 'Indonesia', postal_code: '12190', cuisine: 'Indonesian', certification_body: 'MUI - Majelis Ulama Indonesia', rating: 4.5, price_range: '££', image_url: 'https://images.unsplash.com/photo-1529563021893-cc83c992d75d?w=400', latitude: -6.2273, longitude: 106.7976 },
        // South Africa
        { id: uuidv4(), name: 'Biesmiellah', description: 'Cape Malay cuisine specialist', address: 'Upper Wale Street', city: 'Cape Town', country: 'South Africa', postal_code: '8001', cuisine: 'Cape Malay', certification_body: 'SANHA', rating: 4.6, price_range: '££', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400', latitude: -33.9253, longitude: 18.4239 },
        // Hong Kong Restaurants - IUHK Certified
        { id: uuidv4(), name: 'Islamic Centre Canteen', description: 'Canteen at the Kowloon Masjid Islamic Centre serving authentic halal meals', address: '105 Nathan Road, Tsim Sha Tsui', city: 'Hong Kong', country: 'Hong Kong', postal_code: '', cuisine: 'Multi-cuisine', certification_body: 'IUHK - Islamic Union of Hong Kong', rating: 4.5, price_range: '£', image_url: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400', latitude: 22.2988, longitude: 114.1722 },
        { id: uuidv4(), name: 'Islam Food', description: 'Traditional Pakistani and Indian halal cuisine in the heart of Kowloon', address: '1 Lung Kong Road, Kowloon City', city: 'Hong Kong', country: 'Hong Kong', postal_code: '', cuisine: 'Pakistani', certification_body: 'IUHK - Islamic Union of Hong Kong', rating: 4.4, price_range: '£', image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400', latitude: 22.3282, longitude: 114.1871 },
        { id: uuidv4(), name: 'Ebeneezer\'s Kebabs & Pizzeria', description: 'Popular halal kebabs, pizzas and Middle Eastern dishes', address: '8 Elgin Street, SoHo, Central', city: 'Hong Kong', country: 'Hong Kong', postal_code: '', cuisine: 'Middle Eastern', certification_body: 'IUHK - Islamic Union of Hong Kong', rating: 4.3, price_range: '££', image_url: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400', latitude: 22.2818, longitude: 114.1526 },
        { id: uuidv4(), name: 'Ma\'s Restaurant', description: 'Authentic Xinjiang and Northern Chinese Muslim cuisine', address: '9 Ashley Road, Tsim Sha Tsui', city: 'Hong Kong', country: 'Hong Kong', postal_code: '', cuisine: 'Chinese Muslim', certification_body: 'IUHK - Islamic Union of Hong Kong', rating: 4.6, price_range: '££', image_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400', latitude: 22.2980, longitude: 114.1737 },
        { id: uuidv4(), name: 'Mecca Restaurant', description: 'Serving halal Pakistani and Indian food for over 30 years', address: '7 Minden Avenue, Tsim Sha Tsui', city: 'Hong Kong', country: 'Hong Kong', postal_code: '', cuisine: 'Pakistani', certification_body: 'IUHK - Islamic Union of Hong Kong', rating: 4.2, price_range: '£', image_url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400', latitude: 22.2972, longitude: 114.1752 },
        { id: uuidv4(), name: 'Bismillah Kebab House', description: 'Authentic kebabs and grilled meats from the Middle East', address: '15 Hankow Road, Tsim Sha Tsui', city: 'Hong Kong', country: 'Hong Kong', postal_code: '', cuisine: 'Middle Eastern', certification_body: 'IUHK - Islamic Union of Hong Kong', rating: 4.4, price_range: '££', image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', latitude: 22.2965, longitude: 114.1710 },
        { id: uuidv4(), name: 'Habibi Egyptian Restaurant', description: 'Authentic Egyptian and Middle Eastern halal cuisine', address: '112-114 Lockhart Road, Wan Chai', city: 'Hong Kong', country: 'Hong Kong', postal_code: '', cuisine: 'Egyptian', certification_body: 'IUHK - Islamic Union of Hong Kong', rating: 4.5, price_range: '££', image_url: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=400', latitude: 22.2778, longitude: 114.1722 },
        { id: uuidv4(), name: 'Kashmir Curry House', description: 'Fine Indian and Kashmiri halal cuisine', address: '3 Cleveland Street, Causeway Bay', city: 'Hong Kong', country: 'Hong Kong', postal_code: '', cuisine: 'Indian', certification_body: 'IUHK - Islamic Union of Hong Kong', rating: 4.3, price_range: '££', image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', latitude: 22.2800, longitude: 114.1846 },
        { id: uuidv4(), name: 'Al Maidah Restaurant', description: 'Middle Eastern and Arabic halal specialties', address: '25 Hillwood Road, Tsim Sha Tsui', city: 'Hong Kong', country: 'Hong Kong', postal_code: '', cuisine: 'Arabic', certification_body: 'IUHK - Islamic Union of Hong Kong', rating: 4.4, price_range: '££', image_url: 'https://images.unsplash.com/photo-1593001874117-c99c800e3eb6?w=400', latitude: 22.3010, longitude: 114.1720 },
        { id: uuidv4(), name: 'Pak Loh Chiu Chow (Halal)', description: 'Halal Chiu Chow style Chinese cuisine', address: 'Times Square, Causeway Bay', city: 'Hong Kong', country: 'Hong Kong', postal_code: '', cuisine: 'Chinese', certification_body: 'IUHK - Islamic Union of Hong Kong', rating: 4.5, price_range: '£££', image_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400', latitude: 22.2782, longitude: 114.1827 },
        { id: uuidv4(), name: 'Woodlands Indian Restaurant', description: 'South Indian vegetarian and halal options', address: '8 Minden Avenue, Tsim Sha Tsui', city: 'Hong Kong', country: 'Hong Kong', postal_code: '', cuisine: 'Indian', certification_body: 'IUHK - Islamic Union of Hong Kong', rating: 4.2, price_range: '££', image_url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400', latitude: 22.2975, longitude: 114.1755 },
        { id: uuidv4(), name: 'Shalimar Restaurant', description: 'Traditional North Indian halal cuisine', address: '15 Lock Road, Tsim Sha Tsui', city: 'Hong Kong', country: 'Hong Kong', postal_code: '', cuisine: 'Indian', certification_body: 'IUHK - Islamic Union of Hong Kong', rating: 4.3, price_range: '£', image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400', latitude: 22.2955, longitude: 114.1695 },
        { id: uuidv4(), name: 'Karachi Restaurant', description: 'Delicious Pakistani halal food in Wan Chai', address: 'Wan Chai Road', city: 'Hong Kong', country: 'Hong Kong', postal_code: '', cuisine: 'Pakistani', certification_body: 'IUHK - Islamic Union of Hong Kong', rating: 4.1, price_range: '£', image_url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400', latitude: 22.2770, longitude: 114.1730 },
        { id: uuidv4(), name: 'Bukhara Restaurant', description: 'Mughlai and North Indian halal specialties', address: '12 Temple Street, Yau Ma Tei', city: 'Hong Kong', country: 'Hong Kong', postal_code: '', cuisine: 'Indian', certification_body: 'IUHK - Islamic Union of Hong Kong', rating: 4.4, price_range: '££', image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', latitude: 22.3075, longitude: 114.1700 },
        { id: uuidv4(), name: 'Al-Sultan Restaurant', description: 'Turkish and Middle Eastern halal cuisine', address: '21 Carnarvon Road, Tsim Sha Tsui', city: 'Hong Kong', country: 'Hong Kong', postal_code: '', cuisine: 'Turkish', certification_body: 'IUHK - Islamic Union of Hong Kong', rating: 4.5, price_range: '££', image_url: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400', latitude: 22.2960, longitude: 114.1725 },
    ];

    // Products
    data.products = [
        { id: uuidv4(), name: 'Premium Chicken Breast', brand: 'Shazia Foods', category: 'Meat', certification_body: 'Halal Monitoring Committee (HMC)', description: 'Fresh halal chicken breast, hand slaughtered', available_countries: 'United Kingdom', image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400' },
        { id: uuidv4(), name: 'Lamb Leg', brand: 'Pak Meats', category: 'Meat', certification_body: 'Halal Food Authority (HFA)', description: 'Premium New Zealand lamb, halal certified', available_countries: 'United Kingdom', image_url: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400' },
        { id: uuidv4(), name: 'Beef Mince', brand: 'Tahira Foods', category: 'Meat', certification_body: 'Halal Monitoring Committee (HMC)', description: 'Lean halal beef mince', available_countries: 'United Kingdom', image_url: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400' },
        { id: uuidv4(), name: 'Chicken Wings', brand: 'Zabiha Halal', category: 'Meat', certification_body: 'IFANCA', description: 'Fresh halal chicken wings', available_countries: 'United States,Canada', image_url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400' },
        { id: uuidv4(), name: 'Halal Gummy Bears', brand: 'Haribo', category: 'Snacks', certification_body: 'Halal Food Authority (HFA)', description: 'Halal certified gummy bears without gelatin', available_countries: 'United Kingdom,Germany,United Arab Emirates', image_url: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400' },
        { id: uuidv4(), name: 'Chicken Nuggets', brand: 'Saffron Road', category: 'Frozen', certification_body: 'IFANCA', description: 'Crispy halal chicken nuggets', available_countries: 'United States', image_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400' },
        { id: uuidv4(), name: 'Halal Marshmallows', brand: 'Ziyad', category: 'Snacks', certification_body: 'IFANCA', description: 'Gelatin-free halal marshmallows', available_countries: 'United States,Canada,United Kingdom', image_url: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400' },
        { id: uuidv4(), name: 'Beef Jerky', brand: 'Midamar', category: 'Snacks', certification_body: 'ISA', description: 'Premium halal beef jerky', available_countries: 'United States', image_url: 'https://images.unsplash.com/photo-1604077350837-d2aa95fd6f11?w=400' },
        { id: uuidv4(), name: 'Greek Style Yogurt', brand: 'Muller', category: 'Dairy', certification_body: 'Halal Food Authority (HFA)', description: 'Creamy Greek style yogurt, halal certified', available_countries: 'United Kingdom', image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400' },
        { id: uuidv4(), name: 'Halal Cheese', brand: 'Noor', category: 'Dairy', certification_body: 'Halal Monitoring Committee (HMC)', description: 'Vegetarian rennet cheese, halal certified', available_countries: 'United Kingdom', image_url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400' },
        { id: uuidv4(), name: 'Chicken Tikka Masala', brand: 'Shan Foods', category: 'Ready Meals', certification_body: 'Halal Food Authority (HFA)', description: 'Authentic chicken tikka masala ready meal', available_countries: 'United Kingdom', image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400' },
        { id: uuidv4(), name: 'Lamb Biryani', brand: 'Lahore Delight', category: 'Ready Meals', certification_body: 'Halal Monitoring Committee (HMC)', description: 'Traditional lamb biryani, ready to heat', available_countries: 'United Kingdom', image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400' },
        { id: uuidv4(), name: 'Beef Samosas', brand: 'Halal Kitchen', category: 'Frozen', certification_body: 'IFANCA', description: 'Crispy beef samosas, frozen', available_countries: 'United States,Canada', image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400' },
        { id: uuidv4(), name: 'Halal Chicken Gravy', brand: 'Bisto', category: 'Sauces', certification_body: 'Halal Food Authority (HFA)', description: 'Rich chicken gravy powder', available_countries: 'United Kingdom', image_url: 'https://images.unsplash.com/photo-1635321593217-40050ad13c74?w=400' },
        { id: uuidv4(), name: 'Tandoori Masala', brand: 'Shan', category: 'Spices', certification_body: 'IFANCA', description: 'Authentic tandoori spice mix', available_countries: 'United States,United Kingdom,Canada', image_url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400' },
        { id: uuidv4(), name: 'Mango Lassi', brand: 'Rubicon', category: 'Beverages', certification_body: 'Halal Food Authority (HFA)', description: 'Refreshing mango lassi drink', available_countries: 'United Kingdom', image_url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400' },
        { id: uuidv4(), name: 'Baby Rice Cereal', brand: 'Organix', category: 'Baby Food', certification_body: 'Halal Food Authority (HFA)', description: 'Organic baby rice cereal, halal certified', available_countries: 'United Kingdom', image_url: 'https://images.unsplash.com/photo-1584462198954-01eb6cdf7c59?w=400' },
        { id: uuidv4(), name: 'Rendang Paste', brand: 'Adabi', category: 'Sauces', certification_body: 'JAKIM', description: 'Authentic Malaysian rendang paste', available_countries: 'Malaysia,Singapore,United Kingdom', image_url: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400' },
        { id: uuidv4(), name: 'Nasi Lemak Kit', brand: 'Brahim\'s', category: 'Ready Meals', certification_body: 'JAKIM', description: 'Complete nasi lemak cooking kit', available_countries: 'Malaysia,Singapore', image_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400' },
    ];
}

// Load data on startup
loadData();

// Database interface that mimics better-sqlite3 API
const db = {
    prepare: function(sql) {
        return {
            get: function(...params) {
                return executeQuery(sql, params, 'get');
            },
            all: function(...params) {
                return executeQuery(sql, params, 'all');
            },
            run: function(...params) {
                return executeQuery(sql, params, 'run');
            }
        };
    }
};

function executeQuery(sql, params, type) {
    const lowerSql = sql.toLowerCase().trim();
    
    // SELECT queries
    if (lowerSql.startsWith('select')) {
        return handleSelect(sql, params, type);
    }
    
    // INSERT queries
    if (lowerSql.startsWith('insert')) {
        return handleInsert(sql, params);
    }
    
    // DELETE queries
    if (lowerSql.startsWith('delete')) {
        return handleDelete(sql, params);
    }
    
    return type === 'all' ? [] : null;
}

function handleSelect(sql, params, type) {
    const lowerSql = sql.toLowerCase();
    
    // Determine which table
    let table = null;
    let results = [];
    
    if (lowerSql.includes('from users')) {
        table = 'users';
        results = filterData(data.users, sql, params);
    } else if (lowerSql.includes('from restaurants')) {
        table = 'restaurants';
        results = filterData(data.restaurants, sql, params);
    } else if (lowerSql.includes('from products')) {
        table = 'products';
        results = filterData(data.products, sql, params);
    } else if (lowerSql.includes('from favorites')) {
        table = 'favorites';
        results = filterFavorites(sql, params);
    } else if (lowerSql.includes('from certification_bodies')) {
        table = 'certification_bodies';
        results = data.certification_bodies;
    }
    
    // Handle COUNT
    if (lowerSql.includes('count(*)')) {
        return { count: results.length };
    }
    
    // Handle DISTINCT
    if (lowerSql.includes('distinct country')) {
        const countries = [...new Set(results.map(r => r.country))].filter(Boolean).sort();
        return countries.map(c => ({ country: c }));
    }
    if (lowerSql.includes('distinct city')) {
        const cities = [...new Set(results.map(r => r.city))].filter(Boolean).sort();
        return cities.map(c => ({ city: c }));
    }
    if (lowerSql.includes('distinct cuisine')) {
        const cuisines = [...new Set(results.map(r => r.cuisine))].filter(Boolean).sort();
        return cuisines.map(c => ({ cuisine: c }));
    }
    if (lowerSql.includes('distinct category')) {
        const categories = [...new Set(results.map(r => r.category))].filter(Boolean).sort();
        return categories.map(c => ({ category: c }));
    }
    
    // Sort by rating for restaurants
    if (table === 'restaurants' && lowerSql.includes('order by rating')) {
        results.sort((a, b) => b.rating - a.rating);
    }
    
    return type === 'get' ? results[0] || null : results;
}

function filterData(items, sql, params) {
    let results = [...items];
    const lowerSql = sql.toLowerCase();
    let paramIndex = 0;
    
    // Filter by email
    if (lowerSql.includes('email = ?') || lowerSql.includes('email like ?')) {
        const email = params[paramIndex++];
        results = results.filter(r => r.email === email);
    }
    
    // Filter by country (exact match for city queries)
    if (lowerSql.includes('where country = ?') && !lowerSql.includes('where 1=1')) {
        const country = params[paramIndex++];
        results = results.filter(r => r.country === country);
    }
    
    // Filter by id
    if (lowerSql.includes('id = ?') || lowerSql.includes('where id = ?')) {
        const id = params[paramIndex++];
        results = results.filter(r => r.id === id);
    }
    
    // Complex filters for restaurants/products
    const whereMatches = sql.match(/where 1=1(.*)/i);
    if (whereMatches) {
        const conditions = whereMatches[1];
        let pIdx = 0;
        
        // Country filter
        if (conditions.includes('country LIKE ?')) {
            const val = params[pIdx++].replace(/%/g, '').toLowerCase();
            results = results.filter(r => (r.country || '').toLowerCase().includes(val));
        }
        
        // City filter
        if (conditions.includes('city LIKE ?')) {
            const val = params[pIdx++].replace(/%/g, '').toLowerCase();
            results = results.filter(r => (r.city || '').toLowerCase().includes(val));
        }
        
        // Cuisine filter
        if (conditions.includes('cuisine LIKE ?')) {
            const val = params[pIdx++].replace(/%/g, '').toLowerCase();
            results = results.filter(r => (r.cuisine || '').toLowerCase().includes(val));
        }
        
        // Certification filter
        if (conditions.includes('certification_body LIKE ?')) {
            const val = params[pIdx++].replace(/%/g, '').toLowerCase();
            results = results.filter(r => (r.certification_body || '').toLowerCase().includes(val));
        }
        
        // Category filter
        if (conditions.includes('category LIKE ?')) {
            const val = params[pIdx++].replace(/%/g, '').toLowerCase();
            results = results.filter(r => (r.category || '').toLowerCase().includes(val));
        }
        
        // Brand filter
        if (conditions.includes('brand LIKE ?')) {
            const val = params[pIdx++].replace(/%/g, '').toLowerCase();
            results = results.filter(r => (r.brand || '').toLowerCase().includes(val));
        }
        
        // Available countries filter for products
        if (conditions.includes('available_countries LIKE ?')) {
            const val = params[pIdx++].replace(/%/g, '').toLowerCase();
            results = results.filter(r => (r.available_countries || '').toLowerCase().includes(val));
        }
        
        // Search filter (name, description, cuisine/brand)
        if (conditions.includes('name LIKE ?') && conditions.includes('description LIKE ?')) {
            const searchVal = params[pIdx++].replace(/%/g, '').toLowerCase();
            params[pIdx++]; // skip duplicate
            params[pIdx++]; // skip duplicate
            results = results.filter(r => 
                (r.name || '').toLowerCase().includes(searchVal) ||
                (r.description || '').toLowerCase().includes(searchVal) ||
                (r.cuisine || '').toLowerCase().includes(searchVal) ||
                (r.brand || '').toLowerCase().includes(searchVal)
            );
        }
    }
    
    return results;
}

function filterFavorites(sql, params) {
    const lowerSql = sql.toLowerCase();
    let results = [...data.favorites];
    
    // Filter by user_id
    if (lowerSql.includes('user_id = ?')) {
        const userId = params[0];
        results = results.filter(f => f.user_id === userId);
    }
    
    // Filter by id and user_id for delete
    if (lowerSql.includes('id = ?') && lowerSql.includes('user_id = ?')) {
        results = results.filter(f => f.id === params[0] && f.user_id === params[1]);
    }
    
    // Join with restaurants and products for full data
    results = results.map(f => {
        const restaurant = data.restaurants.find(r => r.id === f.restaurant_id);
        const product = data.products.find(p => p.id === f.product_id);
        return {
            ...f,
            restaurant_name: restaurant?.name,
            restaurant_city: restaurant?.city,
            restaurant_cuisine: restaurant?.cuisine,
            product_name: product?.name,
            product_brand: product?.brand
        };
    });
    
    return results;
}

function handleInsert(sql, params) {
    const lowerSql = sql.toLowerCase();
    
    if (lowerSql.includes('into users')) {
        const user = {
            id: params[0],
            name: params[1],
            email: params[2],
            password: params[3],
            country: params[4],
            created_at: new Date().toISOString()
        };
        data.users.push(user);
        saveData();
    } else if (lowerSql.includes('into favorites')) {
        const favorite = {
            id: params[0],
            user_id: params[1],
            restaurant_id: params[2],
            product_id: params[3],
            created_at: new Date().toISOString()
        };
        data.favorites.push(favorite);
        saveData();
    }
    
    return { changes: 1 };
}

function handleDelete(sql, params) {
    const lowerSql = sql.toLowerCase();
    
    if (lowerSql.includes('from favorites')) {
        const id = params[0];
        const userId = params[1];
        const before = data.favorites.length;
        data.favorites = data.favorites.filter(f => !(f.id === id && f.user_id === userId));
        saveData();
        return { changes: before - data.favorites.length };
    }
    
    return { changes: 0 };
}

console.log('Database initialized with sample data');

module.exports = db;
