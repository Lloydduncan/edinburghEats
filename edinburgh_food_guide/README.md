# Edinburgh Food Guide App (Prototype)

This prototype demonstrates the structure and user interface for a community‑driven food guide focused on cafés and restaurants in Edinburgh.  It includes static HTML pages, basic styling, and simple JavaScript to illustrate how key features of the proposed app could work.

## Key Pages

| Page | Description |
| --- | --- |
| `index.html` | Landing page with a search bar, featured areas and a call‑to‑action. |
| `browse.html` | Browse all venues with filters for area/postcode and cuisine type. |
| `restaurant.html` | Detailed view of a single restaurant or café, including aggregated ratings, user comments and location. |
| `add_recommendation.html` | Form for verified members to submit a recommendation with smiley‑face ratings and receipt upload. |

## Running the Prototype

No build tools are required—just open `index.html` in your browser.  JavaScript loads a small sample dataset from `data.js` and populates the browse and restaurant pages dynamically.

## Extending This Prototype

This prototype focuses on front‑end structure.  To convert it into a production application you would need to:

* Implement user authentication (e.g., OAuth with Facebook and Instagram) and restrict recommendation submissions to verified group members.
* Store listings, recommendations and uploaded receipts in a database with an API (e.g., Node.js/Express, Django or Ruby on Rails).
* Add real search and filtering logic on the server, especially for larger datasets.
* Integrate map services (e.g., Google Maps or OpenStreetMap) to show restaurant locations.
* Add moderation and administrative tools for approving or flagging recommendations.

The simple HTML, CSS and JavaScript contained here provide a foundation for exploring layout and user interactions before building a full back end.