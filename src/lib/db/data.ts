import { 
  Category, 
  Product, 
  PaymentMethodConfig, 
  Banner, 
  SiteSettings 
} from '@/types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: "Women's Fashion",
    slug: 'womens-fashion',
    description: 'Exquisite salwar kameez, maxi dresses, kurtis and designer sarees',
    image_url: '/images/categories/womens-fashion.jpg',
    sort_order: 1,
    is_active: true,
    product_count: 42
  },
  {
    id: 'cat-2',
    name: "Men's Fashion",
    slug: 'mens-fashion',
    description: 'Modern casual shirts, formal wear, and traditional panjabi',
    image_url: '/images/categories/mens-fashion.jpg',
    sort_order: 2,
    is_active: true,
    product_count: 28
  },
  {
    id: 'cat-3',
    name: "Kids Fashion",
    slug: 'kids-fashion',
    description: 'Adorable designer frocks, ethnic wear, and comfortable kids sets',
    image_url: '/images/categories/kids-fashion.jpg',
    sort_order: 3,
    is_active: true,
    product_count: 19
  },
  {
    id: 'cat-4',
    name: "Hijab & Scarf",
    slug: 'hijab-scarf',
    description: 'Premium chiffon, georgette, and modal hijabs & scarves',
    image_url: '/images/categories/hijab-scarf.jpg',
    sort_order: 4,
    is_active: true,
    product_count: 35
  },
  {
    id: 'cat-5',
    name: "Bags & Accessories",
    slug: 'bags-accessories',
    description: 'Luxury designer shoulder bags, clutches, and jewelry',
    image_url: '/images/categories/bags-accessories.jpg',
    sort_order: 5,
    is_active: true,
    product_count: 24
  },
  {
    id: 'cat-6',
    name: "Footwear",
    slug: 'footwear',
    description: 'Comfortable sneakers, party heels, and daily flats',
    image_url: '/images/categories/footwear.jpg',
    sort_order: 6,
    is_active: true,
    product_count: 18
  },
  {
    id: 'cat-7',
    name: "Beauty & Personal Care",
    slug: 'beauty-personal-care',
    description: 'Authentic skincare, fragrances, and beauty essentials',
    image_url: '/images/categories/beauty-personal-care.jpg',
    sort_order: 7,
    is_active: true,
    product_count: 15
  },
  {
    id: 'cat-8',
    name: "Home & Living",
    slug: 'home-living',
    description: 'Boutique decor, bedsheets, and living accessories',
    image_url: '/images/categories/home-living.jpg',
    sort_order: 8,
    is_active: true,
    product_count: 12
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    title: 'Embroidered Salwar Kameez',
    slug: 'embroidered-salwar-kameez',
    sku: 'CNC-ESK-01',
    short_description: 'Exquisite hand-embroidered rose pink georgette salwar kameez set with matching organza dupatta.',
    description: 'Crafted from premium georgette fabric adorned with intricate zardozi and thread embroidery. Includes tailored trousers and an ethereal organza dupatta with scalloped borders. Perfect for festive celebrations and wedding receptions.',
    base_price: 2500,
    base_sale_price: 1999,
    status: 'published',
    is_featured: true,
    is_bestseller: true,
    is_new_arrival: true,
    is_on_sale: true,
    rating: 4.8,
    review_count: 124,
    images: [
      {
        id: 'img-1-1',
        product_id: 'prod-1',
        image_url: '/images/products/salwar-kameez.jpg',
        alt_text: 'Embroidered Salwar Kameez Front View',
        is_primary: true
      }
    ],
    categories: [INITIAL_CATEGORIES[0]],
    variants: [
      {
        id: 'var-1-s-pink',
        product_id: 'prod-1',
        sku: 'CNC-ESK-S-PINK',
        regular_price: 2500,
        sale_price: 1999,
        stock_quantity: 15,
        low_stock_threshold: 5,
        is_active: true,
        image_url: '/images/products/salwar-kameez.jpg',
        attributes: { size: 'S', color: 'Rose Pink' }
      },
      {
        id: 'var-1-m-pink',
        product_id: 'prod-1',
        sku: 'CNC-ESK-M-PINK',
        regular_price: 2500,
        sale_price: 1999,
        stock_quantity: 25,
        low_stock_threshold: 5,
        is_active: true,
        image_url: '/images/products/salwar-kameez.jpg',
        attributes: { size: 'M', color: 'Rose Pink' }
      },
      {
        id: 'var-1-l-pink',
        product_id: 'prod-1',
        sku: 'CNC-ESK-L-PINK',
        regular_price: 2500,
        sale_price: 1999,
        stock_quantity: 18,
        low_stock_threshold: 5,
        is_active: true,
        image_url: '/images/products/salwar-kameez.jpg',
        attributes: { size: 'L', color: 'Rose Pink' }
      },
      {
        id: 'var-1-xl-pink',
        product_id: 'prod-1',
        sku: 'CNC-ESK-XL-PINK',
        regular_price: 2500,
        sale_price: 1999,
        stock_quantity: 8,
        low_stock_threshold: 5,
        is_active: true,
        image_url: '/images/products/salwar-kameez.jpg',
        attributes: { size: 'XL', color: 'Rose Pink' }
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-2',
    title: 'Floral Maxi Dress',
    slug: 'floral-maxi-dress',
    sku: 'CNC-FMD-02',
    short_description: 'Delicate blossom print chiffon maxi dress featuring feminine tiered ruffles and belted waist.',
    description: 'An elegant silhouette designed for garden parties and festive occasions. Breathable chiffon with soft inner lining, balloon sleeves, and a flattering cinch waist.',
    base_price: 1600,
    base_sale_price: 1250,
    status: 'published',
    is_featured: true,
    is_bestseller: true,
    is_new_arrival: false,
    is_on_sale: true,
    rating: 4.7,
    review_count: 98,
    images: [
      {
        id: 'img-2-1',
        product_id: 'prod-2',
        image_url: '/images/products/floral-maxi.jpg',
        alt_text: 'Floral Maxi Dress Full',
        is_primary: true
      }
    ],
    categories: [INITIAL_CATEGORIES[0]],
    variants: [
      {
        id: 'var-2-s-pink',
        product_id: 'prod-2',
        sku: 'CNC-FMD-S-PINK',
        regular_price: 1600,
        sale_price: 1250,
        stock_quantity: 12,
        low_stock_threshold: 4,
        is_active: true,
        image_url: '/images/products/floral-maxi.jpg',
        attributes: { size: 'S', color: 'Pink' }
      },
      {
        id: 'var-2-m-pink',
        product_id: 'prod-2',
        sku: 'CNC-FMD-M-PINK',
        regular_price: 1600,
        sale_price: 1250,
        stock_quantity: 20,
        low_stock_threshold: 5,
        is_active: true,
        image_url: '/images/products/floral-maxi.jpg',
        attributes: { size: 'M', color: 'Pink' }
      },
      {
        id: 'var-2-l-white',
        product_id: 'prod-2',
        sku: 'CNC-FMD-L-WHITE',
        regular_price: 1600,
        sale_price: 1250,
        stock_quantity: 14,
        low_stock_threshold: 4,
        is_active: true,
        image_url: '/images/products/floral-maxi.jpg',
        attributes: { size: 'L', color: 'White' }
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-3',
    title: "Men's Casual Shirt",
    slug: 'mens-casual-shirt',
    sku: 'CNC-MCS-03',
    short_description: 'Tailored slim-fit breathable cotton oxford shirt in deep charcoal black.',
    description: 'A versatile wardrobe essential crafted from 100% long-staple combed cotton. Soft wash finish with mother-of-pearl buttons. Transitions effortlessly from work to weekend.',
    base_price: 1200,
    base_sale_price: 850,
    status: 'published',
    is_featured: false,
    is_bestseller: false,
    is_new_arrival: true,
    is_on_sale: true,
    rating: 4.6,
    review_count: 76,
    images: [
      {
        id: 'img-3-1',
        product_id: 'prod-3',
        image_url: '/images/products/mens-shirt.jpg',
        alt_text: "Men's Casual Shirt",
        is_primary: true
      }
    ],
    categories: [INITIAL_CATEGORIES[1]],
    variants: [
      {
        id: 'var-3-m-black',
        product_id: 'prod-3',
        sku: 'CNC-MCS-M-BLACK',
        regular_price: 1200,
        sale_price: 850,
        stock_quantity: 30,
        low_stock_threshold: 5,
        is_active: true,
        image_url: '/images/products/mens-shirt.jpg',
        attributes: { size: 'M', color: 'Black' }
      },
      {
        id: 'var-3-l-black',
        product_id: 'prod-3',
        sku: 'CNC-MCS-L-BLACK',
        regular_price: 1200,
        sale_price: 850,
        stock_quantity: 25,
        low_stock_threshold: 5,
        is_active: true,
        image_url: '/images/products/mens-shirt.jpg',
        attributes: { size: 'L', color: 'Black' }
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-4',
    title: 'Kids Frock',
    slug: 'kids-frock',
    sku: 'CNC-KF-04',
    short_description: 'Soft pastel pink tiered party frock with sweet bow accent for young princesses.',
    description: 'Designed for comfort and charm. Features hypoallergenic soft cotton inner lining with delicate tulle overlay and satin bow waist.',
    base_price: 1000,
    base_sale_price: 750,
    status: 'published',
    is_featured: false,
    is_bestseller: true,
    is_new_arrival: false,
    is_on_sale: true,
    rating: 4.9,
    review_count: 65,
    images: [
      {
        id: 'img-4-1',
        product_id: 'prod-4',
        image_url: '/images/products/kids-frock.jpg',
        alt_text: 'Kids Frock Pink',
        is_primary: true
      }
    ],
    categories: [INITIAL_CATEGORIES[2]],
    variants: [
      {
        id: 'var-4-m-pink',
        product_id: 'prod-4',
        sku: 'CNC-KF-M-PINK',
        regular_price: 1000,
        sale_price: 750,
        stock_quantity: 22,
        low_stock_threshold: 5,
        is_active: true,
        image_url: '/images/products/kids-frock.jpg',
        attributes: { size: '4-5Y', color: 'Blush Pink' }
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-5',
    title: 'Shoulder Bag',
    slug: 'shoulder-bag',
    sku: 'CNC-SB-05',
    short_description: 'Structured vegan leather shoulder bag with gold-tone hardware and top handles.',
    description: 'Sophisticated and spacious, perfect for carrying essentials with refined poise. Dual compartments with zip closure and detachable crossbody strap.',
    base_price: 1900,
    base_sale_price: 1450,
    status: 'published',
    is_featured: true,
    is_bestseller: false,
    is_new_arrival: true,
    is_on_sale: true,
    rating: 4.7,
    review_count: 88,
    images: [
      {
        id: 'img-5-1',
        product_id: 'prod-5',
        image_url: '/images/products/shoulder-bag.jpg',
        alt_text: 'Shoulder Bag Beige',
        is_primary: true
      }
    ],
    categories: [INITIAL_CATEGORIES[4]],
    variants: [
      {
        id: 'var-5-beige',
        product_id: 'prod-5',
        sku: 'CNC-SB-BEIGE',
        regular_price: 1900,
        sale_price: 1450,
        stock_quantity: 16,
        low_stock_threshold: 4,
        is_active: true,
        image_url: '/images/products/shoulder-bag.jpg',
        attributes: { color: 'Beige' }
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-6',
    title: 'Running Shoes',
    slug: 'running-shoes',
    sku: 'CNC-RS-06',
    short_description: 'Lightweight cushioned athletic sneakers in blush white with ergonomic sole.',
    description: 'Engineered mesh upper for maximum breathability with high-resilience memory foam cushioning for everyday comfort.',
    base_price: 2800,
    base_sale_price: 2200,
    status: 'published',
    is_featured: false,
    is_bestseller: true,
    is_new_arrival: true,
    is_on_sale: true,
    rating: 4.6,
    review_count: 72,
    images: [
      {
        id: 'img-6-1',
        product_id: 'prod-6',
        image_url: '/images/products/running-shoes.jpg',
        alt_text: 'Running Shoes White',
        is_primary: true
      }
    ],
    categories: [INITIAL_CATEGORIES[5]],
    variants: [
      {
        id: 'var-6-38-white',
        product_id: 'prod-6',
        sku: 'CNC-RS-38-WHITE',
        regular_price: 2800,
        sale_price: 2200,
        stock_quantity: 18,
        low_stock_threshold: 5,
        is_active: true,
        image_url: '/images/products/running-shoes.jpg',
        attributes: { size: '38', color: 'White' }
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-7',
    title: 'Cotton Kurti',
    slug: 'cotton-kurti',
    sku: 'CNC-CK-07',
    short_description: 'Boutique handloom cotton kurti with minimal pastel threadwork.',
    description: 'Pure combed cotton daily wear kurti with notched neckline and three-quarter sleeves. Light, airy and elegant.',
    base_price: 2000,
    base_sale_price: 1600,
    status: 'published',
    is_featured: true,
    is_bestseller: false,
    is_new_arrival: false,
    is_on_sale: true,
    rating: 4.8,
    review_count: 45,
    images: [
      {
        id: 'img-7-1',
        product_id: 'prod-7',
        image_url: '/images/products/cotton-kurti.jpg',
        alt_text: 'Cotton Kurti',
        is_primary: true
      }
    ],
    categories: [INITIAL_CATEGORIES[0]],
    variants: [
      {
        id: 'var-7-m-white',
        product_id: 'prod-7',
        sku: 'CNC-CK-M-WHITE',
        regular_price: 2000,
        sale_price: 1600,
        stock_quantity: 15,
        low_stock_threshold: 5,
        is_active: true,
        image_url: '/images/products/cotton-kurti.jpg',
        attributes: { size: 'M', color: 'White' }
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-8',
    title: 'Chiffon Georgette Hijab',
    slug: 'chiffon-georgette-hijab',
    sku: 'CNC-CGH-08',
    short_description: 'Non-slip luxury textured chiffon hijab in signature dusty rose.',
    description: 'Lightweight, breathable, and drapes flawlessly without requiring constant pinning. An everyday royal staple.',
    base_price: 600,
    base_sale_price: 450,
    status: 'published',
    is_featured: true,
    is_bestseller: true,
    is_new_arrival: true,
    is_on_sale: true,
    rating: 4.9,
    review_count: 112,
    images: [
      {
        id: 'img-8-1',
        product_id: 'prod-8',
        image_url: '/images/products/chiffon-hijab.jpg',
        alt_text: 'Chiffon Hijab Dusty Rose',
        is_primary: true
      }
    ],
    categories: [INITIAL_CATEGORIES[3]],
    variants: [
      {
        id: 'var-8-rose',
        product_id: 'prod-8',
        sku: 'CNC-CGH-ROSE',
        regular_price: 600,
        sale_price: 450,
        stock_quantity: 40,
        low_stock_threshold: 10,
        is_active: true,
        image_url: '/images/products/chiffon-hijab.jpg',
        attributes: { color: 'Dusty Rose' }
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const INITIAL_PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    code: 'cod',
    name: 'Cash On Delivery',
    description: 'Pay cash to delivery rider when parcel reaches your doorstep',
    is_active: true,
    instructions: 'Please have the exact cash amount ready for the delivery person.',
    sort_order: 1
  },
  {
    code: 'bkash',
    name: 'bKash',
    description: 'Pay via bKash personal or merchant account',
    is_active: true,
    account_type: 'Merchant',
    recipient_number: '01711-XXXXXX',
    instructions: '1. Open bKash App or dial *247#\n2. Select "Make Payment" or "Send Money"\n3. Recipient Number: 01711-XXXXXX\n4. Enter total order amount\n5. Submit your Transaction ID below.',
    sort_order: 2
  },
  {
    code: 'nagad',
    name: 'Nagad',
    description: 'Pay via Nagad mobile wallet',
    is_active: true,
    account_type: 'Merchant',
    recipient_number: '01722-XXXXXX',
    instructions: '1. Dial *167# or use Nagad App\n2. Select "Send Money"\n3. Send to: 01722-XXXXXX\n4. Submit Transaction ID.',
    sort_order: 3
  },
  {
    code: 'rocket',
    name: 'Rocket',
    description: 'Dutch-Bangla Bank Rocket mobile banking',
    is_active: true,
    account_type: 'Personal',
    recipient_number: '01853-XXXXXX',
    instructions: '1. Dial *322# or use Rocket App\n2. Transfer total bill to 01853-XXXXXX\n3. Enter Transaction ID below.',
    sort_order: 4
  },
  {
    code: 'bank_transfer',
    name: 'Manual Bank Transfer',
    description: 'Direct bank deposit or EFT to our corporate account',
    is_active: true,
    account_type: 'Corporate Account',
    recipient_number: 'City Bank: 1203498172001',
    instructions: 'Transfer order total to City Bank A/C: 1203498172001 (Name: Crown & Chic Ltd.) and provide deposit slip reference.',
    sort_order: 5
  }
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'ban-1',
    title: 'New Collection FOR YOUR BEAUTIFUL YOU',
    subtitle: 'Trendy • Elegant • Royal',
    desktop_image: '/images/hero/hero-model.jpg',
    cta_text: 'Shop Now',
    cta_link: '/products',
    is_active: true,
    sort_order: 1
  },
  {
    id: 'ban-2',
    title: 'Festive Luxury Collection 2026',
    subtitle: 'Handcrafted zardozi, georgette & pure silk ensembles',
    desktop_image: '/images/hero/hero-model.jpg',
    cta_text: 'Explore Now',
    cta_link: '/category/womens-fashion',
    is_active: true,
    sort_order: 2
  }
];

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  announcement_bar: {
    enabled: true,
    text: 'Free Shipping All Over Bangladesh on orders over ৳ 2,500 | Easy Return | 100% Original Products | Track Your Order'
  },
  brand_info: {
    name: 'Crown & Chic',
    tagline: 'Fashion, Beauty & Lifestyle',
    address: 'House 42, Road 11, Banani, Dhaka-1213, Bangladesh',
    phone: '+880 1XXX-XXXXXX',
    email: 'support@crownandchic.com',
    whatsapp: '+880 1XXX-XXXXXX'
  },
  social_links: {
    facebook: 'https://facebook.com/crownandchic',
    instagram: 'https://instagram.com/crownandchic',
    youtube: 'https://youtube.com/@crownandchic',
    tiktok: 'https://tiktok.com/@crownandchic',
    twitter: 'https://x.com/crownandchic'
  },
  shipping_rates: {
    inside_dhaka: 60,
    outside_dhaka: 120,
    free_shipping_threshold: 2500
  }
};
