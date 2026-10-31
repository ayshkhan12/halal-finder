/**
 * Demo data. Every venue, brand, certificate number and phone number here is
 * fictional (phone numbers use Ofcom's reserved drama ranges). Certification
 * bodies are real organisations, listed for reference only.
 *
 * Dates are relative to the moment the database is seeded so the demo never
 * goes stale: most certificates are current, a few are about to expire and
 * one has lapsed, which exercises the app's verification states.
 */

const DAY = 24 * 60 * 60 * 1000;
const isoDate = (offsetDays) => new Date(Date.now() + offsetDays * DAY).toISOString().slice(0, 10);
const img = (id) => `https://images.unsplash.com/photo-${id}?w=800&q=70&auto=format&fit=crop`;

const IMAGES = {
  curry: ['1585937421612-70a008356fbe', '1565557623262-b51c2513a641', '1596797038530-2c107229654b', '1505253758473-96b7015fcd40'],
  karahi: ['1599487488170-d11ec9c172f0', '1567188040759-fb8a883dc6d8'],
  burger: ['1568901346375-23c9450c58cd'],
  grill: ['1529006557810-274b9b2fc783', '1544025162-d76694265947'],
  levant: ['1561651823-34feb02250e4'],
  interior: ['1555396273-367ea4eb4db5', '1552566626-52f8b828add9', '1504674900247-0877df9cc836', '1567521464027-f127ff144326'],
  malay: ['1562565651-7d4948f339eb', '1589302168068-964664d93dc0'],
  satay: ['1529563021893-cc83c992d75d'],
  peri: ['1598103442097-8b74394b95c6'],
  coffee: ['1495474472287-4d71bcdd2085', '1509042239860-f550ce710b93', '1501339847302-ac426a4a7cbb'],
  dessert: ['1551024506-0bccd828d307', '1578985545062-69928b1d9587'],
  grocery: ['1542838132-92c53300491e'],
  butcher: ['1607623814075-e51df1bdc82f', '1602470520998-f4a52199a3d6'],
};
const pick = (kind, i = 0) => img(IMAGES[kind][i % IMAGES[kind].length]);

// Opening-hours presets. Ranges that end at or before they start run past midnight.
const H = {
  restaurant: { mon: [['12:00', '22:30']], tue: [['12:00', '22:30']], wed: [['12:00', '22:30']], thu: [['12:00', '22:30']], fri: [['14:00', '23:30']], sat: [['12:00', '23:30']], sun: [['12:00', '22:00']] },
  closedMonday: { tue: [['17:00', '22:30']], wed: [['17:00', '22:30']], thu: [['17:00', '22:30']], fri: [['17:00', '23:00']], sat: [['12:00', '23:00']], sun: [['12:00', '21:30']] },
  lateNight: { mon: [['16:00', '02:00']], tue: [['16:00', '02:00']], wed: [['16:00', '02:00']], thu: [['16:00', '02:00']], fri: [['16:00', '03:00']], sat: [['16:00', '03:00']], sun: [['16:00', '01:00']] },
  cafe: { mon: [['08:00', '18:00']], tue: [['08:00', '18:00']], wed: [['08:00', '18:00']], thu: [['08:00', '18:00']], fri: [['08:00', '12:30'], ['14:00', '18:00']], sat: [['09:00', '18:00']], sun: [['09:00', '17:00']] },
  dessert: { mon: [['13:00', '00:00']], tue: [['13:00', '00:00']], wed: [['13:00', '00:00']], thu: [['13:00', '00:00']], fri: [['14:00', '01:00']], sat: [['13:00', '01:00']], sun: [['13:00', '00:00']] },
  shop: { mon: [['08:00', '20:00']], tue: [['08:00', '20:00']], wed: [['08:00', '20:00']], thu: [['08:00', '20:00']], fri: [['08:00', '20:00']], sat: [['08:00', '20:00']], sun: [['10:00', '16:00']] },
};

const certifiers = [
  { id: 'hmc', name: 'Halal Monitoring Committee', short_name: 'HMC', country: 'United Kingdom', website: 'https://halalhmc.org', slaughter_policy: 'hand_only', description: 'UK charity that inspects certified premises and supply chains. Its standard requires hand slaughter without stunning.' },
  { id: 'hfa', name: 'Halal Food Authority', short_name: 'HFA', country: 'United Kingdom', website: 'https://halalfoodauthority.com', slaughter_policy: 'stunning_permitted', description: 'UK certification body covering restaurants, manufacturers and retailers. Its standard permits some forms of pre-slaughter stunning.' },
  { id: 'ifanca', name: 'Islamic Food and Nutrition Council of America', short_name: 'IFANCA', country: 'United States', website: 'https://ifanca.org', slaughter_policy: 'varies', description: 'Not-for-profit certifying halal food, ingredients and supplements for manufacturers worldwide.' },
  { id: 'jakim', name: 'Department of Islamic Development Malaysia', short_name: 'JAKIM', country: 'Malaysia', website: 'https://www.halal.gov.my', slaughter_policy: 'varies', description: 'Malaysian government department whose halal logo is recognised in many export markets.' },
  { id: 'mui', name: 'Majelis Ulama Indonesia', short_name: 'MUI', country: 'Indonesia', website: 'https://mui.or.id', slaughter_policy: 'varies', description: 'Indonesian Ulema Council, which issues the halal rulings used in Indonesia\'s national certification.' },
  { id: 'sanha', name: 'South African National Halaal Authority', short_name: 'SANHA', country: 'South Africa', website: 'https://sanha.co.za', slaughter_policy: 'varies', description: 'South African certifier for restaurants, manufacturers and abattoirs.' },
];

// [id, name, category, cuisine, description, address, city, postcode, lat, lng, phone, price, rating, reviews,
//  status, alcoholFree, certifier, certDays, verifiedDaysAgo, hours, image, features]
const R = [
  // Hull
  ['barakah-grill-hull', 'Barakah Grill House', 'takeaway', 'Grill & BBQ', 'Flame-grilled chicken and lamb with house-made chilli and garlic sauces. Known for the mixed grill platter.', '214 Spring Bank', 'Hull', 'HU3 1LT', 53.7489, -0.3524, '01632 960101', 1, 4.6, 228, 'fully_halal', 1, 'hmc', 210, 14, 'lateNight', pick('grill', 0), ['takeaway', 'delivery', 'family_friendly']],
  ['noor-cafe-hull', 'Noor Café & Bakery', 'cafe', 'Café & Pastries', 'Specialty coffee, fresh pastries and breakfast wraps in a relaxed, family-friendly café.', '62 Princes Avenue', 'Hull', 'HU5 3QG', 53.7571, -0.3598, '01632 960102', 1, 4.5, 189, 'fully_halal', 1, 'hfa', 140, 30, 'cafe', pick('coffee', 0), ['dine_in', 'takeaway', 'family_friendly', 'wheelchair_accessible', 'vegetarian_options']],
  ['medina-butchers-hull', 'Medina Halal Butchers', 'butcher', 'Butcher & Grocery', 'Hand-slaughtered lamb, beef and chicken cut to order, plus spices, rice and imported groceries.', '301 Beverley Road', 'Hull', 'HU5 1LS', 53.7643, -0.3468, '01632 960103', 1, 4.7, 312, 'fully_halal', 1, 'hmc', 300, 7, 'shop', pick('butcher', 0), ['parking']],
  ['saffron-lounge-hull', 'Saffron Lounge', 'restaurant', 'Indian', 'Modern Indian dining with a halal menu. Alcohol is served at the bar.', '118 Anlaby Road', 'Hull', 'HU3 2JL', 53.7421, -0.3479, '01632 960104', 3, 4.3, 154, 'halal_options', 0, 'hfa', 95, 45, 'restaurant', pick('curry', 0), ['dine_in', 'takeaway', 'wheelchair_accessible', 'vegetarian_options']],
  ['levant-kitchen-hull', 'Levant Kitchen', 'restaurant', 'Syrian', 'Mezze, shawarma and freshly baked flatbreads from a family who ran a kitchen in Aleppo.', '88 Newland Avenue', 'Hull', 'HU5 3AB', 53.7718, -0.3641, '01632 960105', 2, 4.8, 276, 'fully_halal', 1, 'hmc', 260, 21, 'restaurant', pick('levant', 0), ['dine_in', 'takeaway', 'family_friendly', 'vegetarian_options', 'prayer_space']],
  ['crescent-burger-hull', 'The Crescent Burger Co.', 'takeaway', 'Burgers', 'Smash burgers made with halal British beef, loaded fries and thick shakes.', '17 Jameson Street', 'Hull', 'HU1 3HR', 53.7447, -0.3392, '01632 960106', 2, 4.4, 203, 'fully_halal', 1, 'hfa', 180, 12, 'lateNight', pick('burger', 0), ['dine_in', 'takeaway', 'delivery']],
  ['sweet-habibi-hull', 'Sweet Habibi Desserts', 'dessert', 'Desserts', 'Kunafa, waffles, gelato and milkshakes. Gelatine-free ice cream.', '402 Beverley Road', 'Hull', 'HU5 1LW', 53.7681, -0.3489, '01632 960107', 1, 4.2, 98, 'fully_halal', 1, 'hfa', 22, 60, 'dessert', pick('dessert', 0), ['dine_in', 'takeaway', 'family_friendly']],
  ['anatolia-hull', 'Anatolia Ocakbaşı', 'restaurant', 'Turkish', 'Charcoal-grilled kebabs, pide and meze cooked over an open ocakbaşı grill.', '155 Hessle Road', 'Hull', 'HU3 4AA', 53.7376, -0.3598, '01632 960108', 2, 4.5, 167, 'fully_halal', 1, 'hmc', 330, 9, 'restaurant', pick('grill', 1), ['dine_in', 'takeaway', 'family_friendly', 'parking']],

  // London
  ['al-sham-london', 'Al-Sham Syrian Kitchen', 'restaurant', 'Syrian', 'Family-run since 1992: halal grilled meats, fattoush and bread baked in-house.', '112 Edgware Road', 'London', 'W2 2DZ', 51.5167, -0.1662, '020 7946 0101', 2, 4.8, 512, 'fully_halal', 1, 'hmc', 280, 10, 'restaurant', pick('levant', 0), ['dine_in', 'takeaway', 'delivery', 'family_friendly', 'prayer_space']],
  ['brick-lane-biryani-london', 'Brick Lane Biryani House', 'restaurant', 'Bangladeshi', 'Dum-cooked biryanis and Sylheti curries on London\'s best-known curry street.', '96 Brick Lane', 'London', 'E1 6RL', 51.5213, -0.0717, '020 7946 0102', 2, 4.4, 431, 'fully_halal', 1, 'hfa', 12, 80, 'restaurant', pick('curry', 1), ['dine_in', 'takeaway', 'delivery', 'vegetarian_options']],
  ['whitechapel-grill-london', 'Whitechapel Grill', 'takeaway', 'Grill & BBQ', 'Late-night lamb chops, seekh kebabs and naan straight from the tandoor.', '41 Whitechapel Road', 'London', 'E1 1DU', 51.5191, -0.0626, '020 7946 0103', 1, 4.5, 388, 'fully_halal', 1, 'hmc', 190, 5, 'lateNight', pick('grill', 0), ['takeaway', 'delivery']],
  ['green-street-market-london', 'Green Street Halal Supermarket', 'grocery', 'Supermarket & Butcher', 'Large supermarket with a certified butcher counter, fresh produce and imported goods.', '388 Green Street', 'London', 'E13 9AP', 51.5341, 0.0349, '020 7946 0104', 1, 4.6, 445, 'fully_halal', 1, 'hmc', 240, 18, 'shop', pick('grocery', 0), ['parking', 'wheelchair_accessible']],
  ['tooting-karahi-london', 'Tooting Karahi Corner', 'restaurant', 'Pakistani', 'Lahori lamb karahi cooked to order in iron woks, with charcoal-grilled tikka.', '201 Upper Tooting Road', 'London', 'SW17 7TG', 51.4301, -0.1668, '020 7946 0105', 2, 4.7, 356, 'fully_halal', 1, 'hmc', 150, 25, 'restaurant', pick('karahi', 0), ['dine_in', 'takeaway', 'family_friendly']],
  ['southall-tandoori-london', 'Southall Tandoori Nights', 'restaurant', 'Punjabi', 'Punjabi grills and curries. Its halal certificate has lapsed and is awaiting renewal.', '74 The Broadway', 'London', 'UB1 1QF', 51.5115, -0.3741, '020 7946 0106', 2, 4.1, 210, 'halal_options', 0, 'hfa', -20, 150, 'restaurant', pick('curry', 2), ['dine_in', 'takeaway', 'vegetarian_options']],
  ['camden-bao-london', 'Camden Bao & Grill', 'restaurant', 'Asian Fusion', 'Halal fried-chicken bao, Korean-style wings and rice bowls.', '230 Camden High Street', 'London', 'NW1 8QS', 51.5392, -0.1427, '020 7946 0107', 2, 4.3, 264, 'fully_halal', 1, 'hfa', 120, 33, 'restaurant', pick('satay', 0), ['dine_in', 'takeaway', 'delivery', 'wheelchair_accessible']],
  ['ilford-patisserie-london', 'Ilford Lane Patisserie', 'dessert', 'Bakery & Desserts', 'Baklava, cakes and celebration desserts baked fresh every morning.', '143 Ilford Lane', 'London', 'IG1 2RN', 51.5532, 0.0719, '020 7946 0108', 1, 4.6, 187, 'fully_halal', 1, 'hfa', 200, 40, 'cafe', pick('dessert', 1), ['takeaway', 'family_friendly']],

  // Birmingham
  ['ladypool-balti-birmingham', 'Ladypool Balti House', 'restaurant', 'Balti', 'Birmingham-style baltis served sizzling in the bowl they were cooked in.', '144 Ladypool Road', 'Birmingham', 'B12 8JS', 52.4611, -1.8762, '0121 496 0101', 1, 4.5, 298, 'fully_halal', 1, 'hmc', 230, 16, 'restaurant', pick('curry', 3), ['dine_in', 'takeaway', 'family_friendly', 'parking']],
  ['stratford-shawarma-birmingham', 'Stratford Road Shawarma', 'takeaway', 'Lebanese', 'Chicken and lamb shawarma wraps with toum, pickles and fries.', '520 Stratford Road', 'Birmingham', 'B11 4AJ', 52.4639, -1.8621, '0121 496 0102', 1, 4.4, 176, 'fully_halal', 1, 'hfa', 160, 22, 'lateNight', pick('levant', 0), ['takeaway', 'delivery']],
  ['alum-rock-sweets-birmingham', 'Alum Rock Sweet Centre', 'dessert', 'Mithai & Desserts', 'Traditional South Asian sweets, falooda and hot jalebi.', '310 Alum Rock Road', 'Birmingham', 'B8 3DA', 52.4882, -1.8401, '0121 496 0103', 1, 4.3, 143, 'fully_halal', 1, 'hfa', 270, 50, 'dessert', pick('dessert', 0), ['dine_in', 'takeaway', 'family_friendly']],
  ['small-heath-butchers-birmingham', 'Small Heath Family Butchers', 'butcher', 'Butcher', 'Third-generation butcher supplying hand-slaughtered meat and poultry.', '421 Coventry Road', 'Birmingham', 'B10 0SP', 52.4712, -1.8532, '0121 496 0104', 1, 4.8, 221, 'fully_halal', 1, 'hmc', 310, 3, 'shop', pick('butcher', 1), ['parking']],
  ['digbeth-smash-birmingham', 'Digbeth Smash Burgers', 'restaurant', 'Burgers', 'Street-food burgers and wings in a converted warehouse.', '55 Digbeth High Street', 'Birmingham', 'B5 6DY', 52.4758, -1.8881, '0121 496 0105', 2, 4.2, 198, 'fully_halal', 1, 'hfa', 140, 28, 'closedMonday', pick('burger', 0), ['dine_in', 'takeaway', 'wheelchair_accessible']],

  // Manchester
  ['rusholme-mughal-manchester', 'Rusholme Mughal Palace', 'restaurant', 'Mughlai', 'Grand dining room on the Curry Mile serving nihari, biryani and tandoori platters.', '98 Wilmslow Road', 'Manchester', 'M14 5AL', 53.4566, -2.2266, '0161 496 0101', 2, 4.4, 402, 'fully_halal', 1, 'hmc', 175, 19, 'restaurant', pick('curry', 0), ['dine_in', 'takeaway', 'family_friendly', 'wheelchair_accessible', 'prayer_space']],
  ['curry-mile-kebab-manchester', 'Curry Mile Kebab & Grill', 'takeaway', 'Kebabs', 'Doner, shish and mixed grills until the early hours.', '72 Wilmslow Road', 'Manchester', 'M14 5AL', 53.4547, -2.2262, '0161 496 0102', 1, 4.1, 265, 'fully_halal', 1, 'hfa', 25, 70, 'lateNight', pick('grill', 1), ['takeaway', 'delivery']],
  ['cheetham-hill-cash-manchester', 'Cheetham Hill Cash & Carry', 'grocery', 'Wholesale Grocery', 'Bulk rice, spices, frozen goods and a certified halal meat counter.', '215 Cheetham Hill Road', 'Manchester', 'M8 8LW', 53.5021, -2.2381, '0161 496 0103', 1, 4.5, 133, 'fully_halal', 1, 'hmc', 250, 11, 'shop', pick('grocery', 0), ['parking', 'wheelchair_accessible']],
  ['nq-kunafa-manchester', 'Northern Quarter Coffee & Kunafa', 'cafe', 'Café & Desserts', 'Third-wave coffee with warm kunafa and pistachio pastries.', '31 Oldham Street', 'Manchester', 'M1 1JG', 53.4834, -2.2341, '0161 496 0104', 2, 4.6, 219, 'fully_halal', 1, 'hfa', 205, 15, 'cafe', pick('coffee', 1), ['dine_in', 'takeaway', 'wheelchair_accessible', 'vegetarian_options']],
  ['longsight-mandi-manchester', 'Longsight Yemeni Mandi', 'restaurant', 'Yemeni', 'Slow-cooked lamb mandi and fahsa, served on shared platters.', '540 Stockport Road', 'Manchester', 'M13 0RQ', 53.4581, -2.2009, '0161 496 0105', 2, 4.7, 188, 'fully_halal', 1, 'hmc', 290, 8, 'restaurant', pick('interior', 0), ['dine_in', 'takeaway', 'family_friendly', 'prayer_space']],

  // Bradford
  ['leeds-road-kashmiri-bradford', 'Leeds Road Kashmiri Kitchen', 'restaurant', 'Kashmiri', 'Kashmiri curries, lamb chops and fresh naans, a Leeds Road favourite for 30 years.', '1190 Leeds Road', 'Bradford', 'BD3 8LF', 53.7931, -1.7331, '01632 960201', 2, 4.6, 377, 'fully_halal', 1, 'hmc', 220, 13, 'restaurant', pick('curry', 1), ['dine_in', 'takeaway', 'family_friendly', 'parking', 'prayer_space']],
  ['manningham-grill-bradford', 'Manningham Lane Grill', 'takeaway', 'Grill & BBQ', 'Peri-peri chicken, seekh kebabs and loaded wraps.', '160 Manningham Lane', 'Bradford', 'BD8 7JF', 53.8041, -1.7609, '01632 960202', 1, 4.2, 121, 'fully_halal', 1, 'hfa', 110, 35, 'lateNight', pick('peri', 0), ['takeaway', 'delivery']],
  ['bradford-meat-market', 'Bradford Halal Meat Market', 'butcher', 'Butcher', 'Wholesale and retail halal butcher with weekly specials.', '45 Oak Lane', 'Bradford', 'BD9 4PU', 53.8062, -1.7701, '01632 960203', 1, 4.5, 156, 'fully_halal', 1, 'hmc', 260, 6, 'shop', pick('butcher', 0), ['parking']],

  // Leeds
  ['kabul-grill-leeds', 'Harehills Kabul Grill', 'restaurant', 'Afghan', 'Kabuli pulao, mantu dumplings and charcoal kebabs.', '201 Harehills Road', 'Leeds', 'LS8 5HS', 53.8129, -1.5171, '0113 496 0101', 2, 4.7, 244, 'fully_halal', 1, 'hmc', 240, 20, 'restaurant', pick('grill', 0), ['dine_in', 'takeaway', 'family_friendly']],
  ['headingley-lebanese-leeds', 'Headingley Lebanese Kitchen', 'restaurant', 'Lebanese', 'Hot and cold mezze, charcoal shish and Lebanese breakfasts at weekends.', '33 Otley Road', 'Leeds', 'LS6 3AA', 53.8208, -1.5779, '0113 496 0102', 2, 4.5, 199, 'fully_halal', 1, 'hfa', 135, 27, 'restaurant', pick('levant', 0), ['dine_in', 'takeaway', 'vegetarian_options', 'wheelchair_accessible']],
  ['kirkgate-deli-leeds', 'Kirkgate Halal Deli', 'grocery', 'Deli & Grocery', 'Market deli with halal charcuterie, cheeses and imported groceries.', 'Kirkgate Market, Vicar Lane', 'Leeds', 'LS2 7HY', 53.7969, -1.5401, '0113 496 0103', 2, 4.4, 88, 'fully_halal', 1, 'hfa', 190, 42, 'shop', pick('grocery', 0), ['wheelchair_accessible']],

  // Liverpool
  ['lodge-lane-somali-liverpool', 'Lodge Lane Somali Kitchen', 'restaurant', 'Somali', 'Bariis iskukaris, goat and fresh sabaayad, with Somali tea.', '68 Lodge Lane', 'Liverpool', 'L8 0QL', 53.3966, -2.9604, '0151 496 0101', 1, 4.6, 142, 'fully_halal', 1, 'hmc', 280, 17, 'restaurant', pick('interior', 1), ['dine_in', 'takeaway', 'family_friendly', 'prayer_space']],
  ['smithdown-peri-liverpool', 'Smithdown Road Peri Peri', 'takeaway', 'Peri Peri', 'Flame-grilled peri-peri chicken and spicy rice, popular with students.', '310 Smithdown Road', 'Liverpool', 'L15 5AN', 53.3929, -2.9449, '0151 496 0102', 1, 4.3, 231, 'fully_halal', 1, 'hfa', 160, 24, 'lateNight', pick('peri', 0), ['dine_in', 'takeaway', 'delivery']],
  ['bold-street-persian-liverpool', 'Bold Street Persian Grill', 'restaurant', 'Persian', 'Saffron rice, koobideh and jujeh kebabs, with fesenjan on Fridays.', '72 Bold Street', 'Liverpool', 'L1 4HR', 53.4019, -2.9799, '0151 496 0103', 2, 4.7, 305, 'fully_halal', 1, 'hmc', 210, 9, 'restaurant', pick('grill', 1), ['dine_in', 'takeaway', 'vegetarian_options', 'wheelchair_accessible']],
  ['kensington-grocers-liverpool', 'Kensington Halal Grocers', 'grocery', 'Grocery & Butcher', 'Neighbourhood grocer with a halal meat counter and fresh bread daily.', '120 Kensington', 'Liverpool', 'L7 8XB', 53.4101, -2.9551, '0151 496 0104', 1, 4.4, 76, 'fully_halal', 1, 'hmc', 230, 31, 'shop', pick('grocery', 0), ['parking']],

  // Leicester
  ['golden-mile-thali-leicester', 'Golden Mile Thali House', 'restaurant', 'Gujarati & Punjabi', 'Unlimited thalis with halal meat and vegetarian options on Belgrave Road.', '88 Belgrave Road', 'Leicester', 'LE4 5AS', 52.6531, -1.1231, '0116 496 0101', 1, 4.5, 214, 'fully_halal', 1, 'hfa', 175, 26, 'restaurant', pick('curry', 2), ['dine_in', 'takeaway', 'family_friendly', 'vegetarian_options']],
  ['narborough-turkish-leicester', 'Narborough Road Turkish Grill', 'restaurant', 'Turkish', 'Adana kebabs, lahmacun and baklava, all cooked over charcoal.', '160 Narborough Road', 'Leicester', 'LE3 0BT', 52.6239, -1.1579, '0116 496 0102', 2, 4.4, 167, 'fully_halal', 1, 'hmc', 250, 14, 'restaurant', pick('grill', 0), ['dine_in', 'takeaway', 'family_friendly']],
  ['evington-malaysian-leicester', 'Evington Road Malaysian Café', 'cafe', 'Malaysian', 'Nasi lemak, roti canai and teh tarik in a cosy café.', '45 Evington Road', 'Leicester', 'LE2 1QG', 52.6302, -1.1081, '0116 496 0103', 1, 4.6, 112, 'fully_halal', 1, 'hfa', 150, 37, 'cafe', pick('malay', 0), ['dine_in', 'takeaway', 'vegetarian_options']],

  // Glasgow
  ['pollokshields-karahi-glasgow', 'Pollokshields Karahi House', 'restaurant', 'Pakistani', 'Karahi, haleem and fresh tandoori breads on the south side.', '310 Albert Drive', 'Glasgow', 'G41 5RS', 55.8411, -4.2781, '0141 496 0101', 2, 4.6, 253, 'fully_halal', 1, 'hmc', 230, 12, 'restaurant', pick('karahi', 1), ['dine_in', 'takeaway', 'family_friendly', 'parking']],
  ['woodlands-shawarma-glasgow', 'Woodlands Road Shawarma', 'takeaway', 'Middle Eastern', 'Shawarma, falafel and fresh juices near the university.', '22 Woodlands Road', 'Glasgow', 'G3 6UR', 55.8681, -4.2771, '0141 496 0102', 1, 4.3, 140, 'fully_halal', 1, 'hfa', 190, 29, 'lateNight', pick('levant', 0), ['takeaway', 'delivery', 'vegetarian_options']],
];

function ean13(base12) {
  const digits = base12.split('').map(Number);
  const sum = digits.reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0);
  return base12 + ((10 - (sum % 10)) % 10);
}

// Barcodes use the 20x "in-store" GS1 range so they can never collide with real products.
// [id, name, brand, category, description, size, barcodeBase, certifier, certDays, image, dietary, stockists]
const P = [
  ['beef-mince-pure-halal', 'Premium Beef Mince', 'Pure Halal Co.', 'Meat & Poultry', 'Lean British beef mince, 10% fat, hand slaughtered.', '500 g', '200100000001', 'hmc', 240, img('1607623814075-e51df1bdc82f'), ['hand_slaughtered', 'alcohol_free'], ['medina-butchers-hull', 'small-heath-butchers-birmingham', 'bradford-meat-market', 'green-street-market-london']],
  ['chicken-breast-al-barakah', 'Chicken Breast Fillets', 'Al-Barakah Foods', 'Meat & Poultry', 'Skinless chicken breast fillets from UK farms.', '1 kg', '200100000002', 'hmc', 190, img('1604503468506-a8da13d82791'), ['hand_slaughtered', 'alcohol_free'], ['medina-butchers-hull', 'cheetham-hill-cash-manchester', 'kensington-grocers-liverpool']],
  ['lamb-leg-steaks-crescent', 'Lamb Leg Steaks', 'Crescent Meats', 'Meat & Poultry', 'British lamb leg steaks, ready for the grill.', '400 g', '200100000003', 'hfa', 160, img('1602470520998-f4a52199a3d6'), ['alcohol_free'], ['green-street-market-london', 'kirkgate-deli-leeds', 'cheetham-hill-cash-manchester']],
  ['chicken-wings-al-barakah', 'Chicken Wings', 'Al-Barakah Foods', 'Meat & Poultry', 'Fresh chicken wings, great for marinating.', '1 kg', '200100000004', 'hfa', 150, img('1567620832903-9fc6debc209f'), ['alcohol_free'], ['medina-butchers-hull', 'kensington-grocers-liverpool']],
  ['greek-yoghurt-noor', 'Greek-Style Yoghurt', 'Noor Dairy', 'Dairy', 'Thick, creamy yoghurt made without gelatine.', '500 g', '200100000005', 'hfa', 210, img('1488477181946-6428a0291777'), ['gelatine_free', 'vegetarian', 'alcohol_free'], ['green-street-market-london', 'kirkgate-deli-leeds', 'medina-butchers-hull']],
  ['cheddar-noor', 'Mature Cheddar', 'Noor Dairy', 'Dairy', 'Mature cheddar made with microbial (vegetarian) rennet.', '350 g', '200100000006', 'hfa', 200, img('1486297678162-eb2a19b0a32d'), ['vegetarian', 'alcohol_free'], ['kirkgate-deli-leeds', 'green-street-market-london']],
  ['tahini-levant', 'Tahini Paste', 'Levant Kitchen', 'Pantry', 'Stone-ground sesame tahini.', '350 g', '200100000007', 'ifanca', 300, img('1596040033229-a9821ebd058d'), ['vegan', 'alcohol_free'], ['green-street-market-london', 'cheetham-hill-cash-manchester', 'kensington-grocers-liverpool']],
  ['fruit-gums-jelly-joy', 'Fruit Gums', 'Jelly Joy', 'Sweets & Snacks', 'Chewy fruit gums made with halal beef gelatine.', '150 g', '200100000008', 'hfa', 120, img('1582058091505-f87a2e55a40f'), ['alcohol_free'], ['medina-butchers-hull', 'green-street-market-london', 'kensington-grocers-liverpool']],
  ['cola-bottles-jelly-joy', 'Fizzy Cola Bottles', 'Jelly Joy', 'Sweets & Snacks', 'Sour cola sweets. This product\'s certificate has lapsed.', '150 g', '200100000009', 'hfa', -35, img('1582058091505-f87a2e55a40f'), ['alcohol_free'], ['medina-butchers-hull']],
  ['marshmallows-cloud-nine', 'Vanilla Marshmallows', 'Cloud Nine', 'Sweets & Snacks', 'Soft marshmallows made with halal beef gelatine.', '200 g', '200100000010', 'ifanca', 260, img('1511381939415-e44015466834'), ['alcohol_free'], ['green-street-market-london', 'cheetham-hill-cash-manchester']],
  ['tandoori-masala-spice-route', 'Tandoori Masala', 'Spice Route', 'Pantry', 'Smoky spice blend for tandoori chicken and paneer.', '100 g', '200100000011', 'ifanca', 330, img('1596040033229-a9821ebd058d'), ['vegan', 'alcohol_free'], ['medina-butchers-hull', 'small-heath-butchers-birmingham', 'cheetham-hill-cash-manchester', 'bradford-meat-market']],
  ['tikka-masala-shahi', 'Chicken Tikka Masala', 'Shahi Kitchen', 'Ready Meals', 'Chargrilled chicken in a creamy tomato sauce with pilau rice.', '400 g', '200100000012', 'hfa', 180, img('1565557623262-b51c2513a641'), ['alcohol_free'], ['green-street-market-london', 'kirkgate-deli-leeds']],
  ['lamb-biryani-lahore-delight', 'Lamb Biryani', 'Lahore Delight', 'Ready Meals', 'Slow-cooked lamb layered with basmati and saffron.', '450 g', '200100000013', 'hmc', 26, img('1563379091339-03b21ab4a4f8'), ['hand_slaughtered', 'alcohol_free'], ['medina-butchers-hull', 'bradford-meat-market', 'small-heath-butchers-birmingham']],
  ['beef-samosas-samosa-street', 'Beef Samosas', 'Samosa Street', 'Frozen', 'Crispy pastry filled with spiced minced beef. Twelve per pack.', '12 pack', '200100000014', 'hmc', 230, img('1601050690597-df0568f70950'), ['hand_slaughtered', 'alcohol_free'], ['cheetham-hill-cash-manchester', 'green-street-market-london', 'bradford-meat-market']],
  ['chicken-nuggets-crispy-crescent', 'Chicken Nuggets', 'Crispy Crescent', 'Frozen', 'Breaded chicken breast nuggets, oven or air-fryer ready.', '800 g', '200100000015', 'hfa', 170, img('1562967914-608f82629710'), ['alcohol_free'], ['cheetham-hill-cash-manchester', 'kensington-grocers-liverpool', 'medina-butchers-hull']],
  ['mango-lassi-mango-mist', 'Mango Lassi', 'Mango Mist', 'Drinks', 'Alphonso mango and yoghurt drink.', '1 L', '200100000016', 'hfa', 140, img('1553530666-ba11a7da3888'), ['vegetarian', 'gelatine_free', 'alcohol_free'], ['green-street-market-london', 'medina-butchers-hull']],
  ['rendang-paste-rasa', 'Rendang Curry Paste', 'Rasa Malaysia', 'Pantry', 'Authentic Malaysian rendang paste, imported.', '185 g', '200100000017', 'jakim', 280, img('1574484284002-952d92456975'), ['alcohol_free'], ['green-street-market-london', 'cheetham-hill-cash-manchester']],
  ['nasi-lemak-kit-nusantara', 'Nasi Lemak Kit', 'Nusantara', 'Ready Meals', 'Coconut rice, sambal and anchovies. Just add egg.', '350 g', '200100000018', 'jakim', 210, img('1589302168068-964664d93dc0'), ['alcohol_free'], ['green-street-market-london']],
  ['chicken-gravy-sunday-roast', 'Chicken Gravy Granules', 'Sunday Roast', 'Pantry', 'Rich chicken gravy made with halal chicken fat.', '200 g', '200100000019', 'hfa', 250, img('1635321593217-40050ad13c74'), ['alcohol_free'], ['medina-butchers-hull', 'kensington-grocers-liverpool', 'kirkgate-deli-leeds']],
  ['peri-sauce-peri-fire', 'Hot Peri-Peri Sauce', 'Peri Fire', 'Pantry', 'Bird\'s eye chilli, lemon and garlic sauce.', '250 ml', '200100000020', 'hfa', 300, img('1598103442097-8b74394b95c6'), ['vegan', 'alcohol_free'], ['medina-butchers-hull', 'green-street-market-london', 'kensington-grocers-liverpool', 'small-heath-butchers-birmingham']],
];

function seed(db) {
  const insertCertifier = db.prepare(`INSERT INTO certifiers (id, name, short_name, country, website, description, slaughter_policy)
    VALUES ($id, $name, $short_name, $country, $website, $description, $slaughter_policy)`);
  const insertRestaurant = db.prepare(`INSERT INTO restaurants
    (id, name, category, cuisine, description, address, city, postcode, lat, lng, phone, price_level, rating, review_count,
     halal_status, alcohol_free, hand_slaughtered, features, hours, image_url, certifier_id, cert_number, cert_expires, last_verified)
    VALUES ($id, $name, $category, $cuisine, $description, $address, $city, $postcode, $lat, $lng, $phone, $price, $rating, $reviews,
     $status, $alcoholFree, $hand, $features, $hours, $image, $certifier, $certNumber, $certExpires, $lastVerified)`);
  const insertProduct = db.prepare(`INSERT INTO products
    (id, name, brand, category, description, size, barcode, image_url, dietary, certifier_id, cert_number, cert_expires, last_verified)
    VALUES ($id, $name, $brand, $category, $description, $size, $barcode, $image, $dietary, $certifier, $certNumber, $certExpires, $lastVerified)`);
  const insertStockist = db.prepare('INSERT INTO product_stockists (product_id, restaurant_id) VALUES (?, ?)');

  db.exec('BEGIN');
  try {
    for (const c of certifiers) insertCertifier.run(c);

    R.forEach((r, i) => {
      const [id, name, category, cuisine, description, address, city, postcode, lat, lng, phone, price, rating, reviews,
        status, alcoholFree, certifier, certDays, verifiedAgo, hours, image, features] = r;
      insertRestaurant.run({
        id, name, category, cuisine, description, address, city, postcode, lat, lng, phone, price, rating, reviews,
        status, alcoholFree, hand: certifier === 'hmc' ? 1 : 0,
        features: JSON.stringify(features), hours: JSON.stringify(H[hours]), image,
        certifier, certNumber: `DEMO-${certifier.toUpperCase()}-${10400 + i}`,
        certExpires: isoDate(certDays), lastVerified: isoDate(-verifiedAgo),
      });
    });

    P.forEach((p, i) => {
      const [id, name, brand, category, description, size, barcodeBase, certifier, certDays, image, dietary, stockists] = p;
      insertProduct.run({
        id, name, brand, category, description, size, barcode: ean13(barcodeBase), image,
        dietary: JSON.stringify(dietary), certifier, certNumber: `DEMO-${certifier.toUpperCase()}-P${2100 + i}`,
        certExpires: isoDate(certDays), lastVerified: isoDate(-(10 + (i * 7) % 60)),
      });
      for (const s of stockists) insertStockist.run(id, s);
    });
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

module.exports = { seed, ean13 };
