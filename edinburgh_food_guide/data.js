/**
 * Sample data for the Edinburgh Food Guide prototype.
 *
 * Each restaurant object includes basic details, average ratings for
 * four categories and a few example comments.  In a production
 * application this data would come from a database and include many
 * more fields (address, social links, etc.).
 */
window.FOOD_DATA = [
  {
    id: "coffee-corner",
    name: "Coffee Corner",
    area: "Old Town",
    postcode: "EH1 1QS",
    type: "Café",
    description:
      "A cosy café offering locally roasted coffee, homemade cakes and light lunches."
      + " Hidden down a cobbled alleyway near the Royal Mile, it's a perfect spot for a relaxed break.",
    image: "images/coffee_corner.jpg",
    /* Additional fields matching the extended schema */
    cuisine_type: "cafe",
    address: "1 Cobble Close, Old Town, Edinburgh",
    phone: "0131 123 4567",
    website: "https://coffeecorner.ed/eats",
    price_range: "££",
    opening_hours: "Mon-Fri 8:00–18:00; Sat-Sun 9:00–17:00",
    verified: true,
    ratings: {
      price: 4.5,
      quality: 4.8,
      service: 4.9,
      ambience: 4.3,
      menu: 4.2,
    },
    comments: [
      {
        user: "Alice",
        date: "2025-08-02",
        text: "Love the flat whites here! Friendly staff and great atmosphere.",
        ratings: { price: 4, quality: 5, service: 5, ambience: 4, menu: 4 },
        /**
         * This comment is from a verified diner (they uploaded a receipt).
         * The issueStatus field can be "resolved" or "unresolved" to indicate
         * whether any reported issues have been addressed between the
         * diner and the owner.  In a real system this would be
         * moderated and updated via back‑end logic.
         */
        verified: true,
        issueStatus: "resolved",
      },
      {
        user: "Ben",
        date: "2025-07-15",
        text: "Their cakes are to die for. Slightly pricey but worth it.",
        ratings: { price: 3, quality: 5, service: 5, ambience: 3, menu: 4 },
        verified: false,
        issueStatus: "unresolved",
      },
    ],
  },
  {
    id: "seafood-bistro",
    name: "Seafood Bistro",
    area: "Leith",
    postcode: "EH6 6LH",
    type: "Seafood",
    description:
      "An elegant waterfront restaurant specialising in fresh Scottish seafood and shellfish."
      + " Floor‑to‑ceiling windows provide a stunning view over the harbour.",
    image: "images/seafood_bistro.jpg",
    cuisine_type: "seafood",
    address: "15 Harbour Road, Leith, Edinburgh",
    phone: "0131 234 5678",
    website: "https://seafoodbistro.ed/eats",
    price_range: "£££",
    opening_hours: "Tue-Sun 12:00–22:00; Closed Mon",
    verified: true,
    ratings: {
      price: 3.7,
      quality: 4.9,
      service: 4.5,
      ambience: 4.8,
      menu: 4.6,
    },
    comments: [
      {
        user: "Chloe",
        date: "2025-06-28",
        text: "The lobster special was incredible. Portions could be bigger for the price.",
        ratings: { price: 3, quality: 5, service: 4, ambience: 5, menu: 5 },
        verified: true,
        issueStatus: "resolved",
      },
      {
        user: "David",
        date: "2025-05-30",
        text: "Great selection of wines and attentive service.",
        ratings: { price: 4, quality: 5, service: 5, ambience: 4, menu: 4 },
        verified: true,
        issueStatus: "resolved",
      },
    ],
  },
  {
    id: "curry-house",
    name: "Curry House",
    area: "Newington",
    postcode: "EH8 9AD",
    type: "Indian",
    description:
      "A family‑run Indian restaurant serving authentic curries, tandoori dishes and vegetarian options."
      + " Warm décor and friendly service make it popular with locals.",
    image: "images/curry_house.jpg",
    cuisine_type: "indian",
    address: "42 South Street, Newington, Edinburgh",
    phone: "0131 345 6789",
    website: "https://curryhouse.ed/eats",
    price_range: "££",
    opening_hours: "Daily 12:00–23:00",
    verified: false,
    ratings: {
      price: 4.9,
      quality: 4.4,
      service: 4.6,
      ambience: 4.2,
      menu: 4.7,
    },
    comments: [
      {
        user: "Emma",
        date: "2025-08-05",
        text: "Great value for money and generous portions. Love the butter chicken!",
        ratings: { price: 5, quality: 4, service: 5, ambience: 4, menu: 5 },
        verified: false,
        issueStatus: "unresolved",
      },
      {
        user: "Fiona",
        date: "2025-07-20",
        text: "Delicious veggie options and friendly staff.",
        ratings: { price: 5, quality: 4, service: 4, ambience: 3, menu: 5 },
        verified: true,
        issueStatus: "resolved",
      },
    ],
  },
];