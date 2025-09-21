/*
 * Simple client‑side logic for the Edinburgh Food Guide prototype.
 *
 * This script reads query parameters to determine which page logic to
 * execute.  For `browse.html` it generates the list of restaurants
 * based on filters; for `restaurant.html` it renders a single
 * restaurant; and for `add_recommendation.html` it sets up a form
 * with interactive smiley ratings.  Since there is no back end in
 * this prototype, form submissions simply log the results to the
 * console.
 */

// Utility to get query parameters
function getQueryParams() {
  const params = {};
  const queryString = window.location.search.substring(1);
  const pairs = queryString.split("&");
  for (const pair of pairs) {
    if (!pair) continue;
    const [key, value] = pair.split("=").map(decodeURIComponent);
    params[key] = value;
  }
  return params;
}

// Initialize appropriate page based on body data attribute
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.getAttribute("data-page");
  switch (page) {
    case "browse":
      initBrowsePage();
      break;
    case "restaurant":
      initRestaurantPage();
      break;
    case "add":
      initAddRecommendationPage();
      break;
    case "home":
      initHomePage();
      break;
    case "moderation":
      initModerationPage();
      break;
    case "areas":
      initAreasPage();
      break;
    default:
      // Home page has no dynamic logic
      break;
  }
});

/* Browse page logic */
function initBrowsePage() {
  const params = getQueryParams();
  const searchTerm = (params.q || "").toLowerCase();
  const filterArea = params.area || "";
  const filterType = params.type || "";
  const filterPrice = params.price_range || "";
  const filterVerified = params.verified || "";
  // Location parameter for nearby search (area/postcode/address)
  const locationTerm = (params.location || "").toLowerCase();

  // Populate filter options
  const areaSelect = document.getElementById("filter-area");
  const typeSelect = document.getElementById("filter-type");
  const priceSelect = document.getElementById("filter-price");
  const verifiedCheckbox = document.getElementById("filter-verified");
  const areas = [...new Set(window.FOOD_DATA.map((r) => r.area))];
  const types = [...new Set(window.FOOD_DATA.map((r) => r.type))];
  for (const area of areas) {
    const opt = document.createElement("option");
    opt.value = area;
    opt.textContent = area;
    if (area === filterArea) opt.selected = true;
    areaSelect.appendChild(opt);
  }
  for (const type of types) {
    const opt = document.createElement("option");
    opt.value = type;
    opt.textContent = type;
    if (type === filterType) opt.selected = true;
    typeSelect.appendChild(opt);
  }
  // Set price select based on query param
  if (priceSelect) {
    priceSelect.value = filterPrice;
  }
  // Set verified checkbox
  if (verifiedCheckbox) {
    verifiedCheckbox.checked = filterVerified === "true";
  }

  // Filter data based on search term and selected filters
  let filtered = window.FOOD_DATA;
  if (searchTerm) {
    filtered = filtered.filter((r) => r.name.toLowerCase().includes(searchTerm));
  }
  if (filterArea) {
    filtered = filtered.filter((r) => r.area === filterArea);
  }
  if (filterType) {
    filtered = filtered.filter((r) => r.type === filterType);
  }
  // Filter by price range
  if (filterPrice) {
    filtered = filtered.filter((r) => r.price_range === filterPrice);
  }
  // Filter by verified flag (listing verified by admin)
  if (filterVerified === "true") {
    filtered = filtered.filter((r) => r.verified === true);
  }
  // If location search is provided, match against area or postcode (case‑insensitive).
  if (locationTerm) {
    filtered = filtered.filter((r) => {
      return (
        r.area.toLowerCase().includes(locationTerm) ||
        r.postcode.toLowerCase().includes(locationTerm)
      );
    });
  }

  // Render list
  const grid = document.getElementById("results-grid");
  grid.innerHTML = "";
  if (filtered.length === 0) {
    const message = document.createElement("p");
    message.textContent = "No restaurants match your search criteria.";
    grid.appendChild(message);
    return;
  }
  for (const restaurant of filtered) {
    const card = document.createElement("div");
    card.className = "card";
    // Image
    const img = document.createElement("img");
    img.src = restaurant.image;
    img.alt = restaurant.name;
    card.appendChild(img);
    // Content
    const content = document.createElement("div");
    content.className = "card-content";
    const title = document.createElement("h3");
    title.textContent = restaurant.name;
    content.appendChild(title);
    const desc = document.createElement("p");
    desc.textContent = restaurant.description;
    content.appendChild(desc);
    // Ratings summary (average of four categories)
    const ratingsRow = document.createElement("div");
    ratingsRow.className = "ratings";
    for (const key of ["price", "quality", "service", "ambience", "menu"]) {
      const item = document.createElement("div");
      item.className = "rating-item";
      const smile = document.createElement("span");
      const value = restaurant.ratings[key];
      smile.textContent = getSmileyFromRating(value);
      const label = document.createElement("span");
      label.textContent = key.charAt(0).toUpperCase() + key.slice(1);
      item.appendChild(smile);
      item.appendChild(label);
      ratingsRow.appendChild(item);
    }
    content.appendChild(ratingsRow);
    // Link to details
    const link = document.createElement("a");
    link.href = `restaurant.html?id=${restaurant.id}`;
    link.textContent = "View details";
    content.appendChild(link);
    card.appendChild(content);
    grid.appendChild(card);
  }

  // Hook up filter change handlers
  document.getElementById("filter-form").addEventListener("change", (e) => {
    const selectedArea = areaSelect.value;
    const selectedType = typeSelect.value;
    const selectedPrice = priceSelect.value;
    const isVerified = verifiedCheckbox.checked;
    const query = new URLSearchParams();
    if (searchTerm) query.set("q", params.q);
    if (selectedArea) query.set("area", selectedArea);
    if (selectedType) query.set("type", selectedType);
    if (selectedPrice) query.set("price_range", selectedPrice);
    if (isVerified) query.set("verified", "true");
    // Preserve location field from params
    if (locationTerm) query.set("location", params.location);
    window.location.search = query.toString();
  });

  // Sync filter inputs with query params
  const searchInput = document.getElementById("search-input");
  const locationInput = document.getElementById("location-input");
  if (searchTerm) searchInput.value = params.q;
  if (locationTerm) locationInput.value = params.location;

  // Listen for changes on search and location inputs and submit the form automatically
  searchInput.addEventListener("input", () => {
    const query = new URLSearchParams();
    const term = searchInput.value.trim();
    if (term) query.set("q", term);
    const loc = locationInput.value.trim();
    if (loc) query.set("location", loc);
    const selectedArea = areaSelect.value;
    const selectedType = typeSelect.value;
    const selectedPrice = priceSelect.value;
    const isVerified = verifiedCheckbox.checked;
    if (selectedArea) query.set("area", selectedArea);
    if (selectedType) query.set("type", selectedType);
    if (selectedPrice) query.set("price_range", selectedPrice);
    if (isVerified) query.set("verified", "true");
    window.location.search = query.toString();
  });
  locationInput.addEventListener("input", () => {
    const query = new URLSearchParams();
    const term = searchInput.value.trim();
    if (term) query.set("q", term);
    const loc = locationInput.value.trim();
    if (loc) query.set("location", loc);
    const selectedArea = areaSelect.value;
    const selectedType = typeSelect.value;
    const selectedPrice = priceSelect.value;
    const isVerified = verifiedCheckbox.checked;
    if (selectedArea) query.set("area", selectedArea);
    if (selectedType) query.set("type", selectedType);
    if (selectedPrice) query.set("price_range", selectedPrice);
    if (isVerified) query.set("verified", "true");
    window.location.search = query.toString();
  });
}

/* Restaurant detail page logic */
function initRestaurantPage() {
  const params = getQueryParams();
  const restaurant = window.FOOD_DATA.find((r) => r.id === params.id);
  if (!restaurant) {
    document.getElementById("restaurant-container").innerHTML =
      "<p>Restaurant not found.</p>";
    return;
  }
  // Populate header
  document.getElementById("restaurant-name").textContent = restaurant.name;
  const imageEl = document.getElementById("restaurant-image");
  imageEl.src = restaurant.image;
  imageEl.alt = restaurant.name;
  document.getElementById("restaurant-description").textContent = restaurant.description;
  // Additional details (address, phone, website, price range, hours)
  const detailsEl = document.getElementById("restaurant-details");
  let detailsHtml = "";
  if (restaurant.address) detailsHtml += `<p><strong>Address:</strong> ${restaurant.address}</p>`;
  if (restaurant.phone) detailsHtml += `<p><strong>Phone:</strong> ${restaurant.phone}</p>`;
  if (restaurant.website) detailsHtml += `<p><strong>Website:</strong> <a href="${restaurant.website}" target="_blank">${restaurant.website}</a></p>`;
  if (restaurant.price_range) detailsHtml += `<p><strong>Price range:</strong> ${restaurant.price_range}</p>`;
  if (restaurant.opening_hours) detailsHtml += `<p><strong>Opening hours:</strong> ${restaurant.opening_hours}</p>`;
  if (restaurant.verified !== undefined) {
    detailsHtml += `<p><strong>Verified:</strong> ${restaurant.verified ? "Yes" : "No"}</p>`;
  }
  if (detailsEl) detailsEl.innerHTML = detailsHtml;
  // Ratings summary
  const summary = document.getElementById("ratings-summary");
  summary.innerHTML = "";
  // Compute dynamic averages from comments.  If no comments for a
  // category, fall back to the restaurant's static rating.
  const categories = ["price", "quality", "service", "ambience", "menu"];
  const avgRatings = {};
  for (const cat of categories) {
    let total = 0;
    let count = 0;
    for (const cmt of restaurant.comments) {
      const val = cmt.ratings && cmt.ratings[cat];
      if (typeof val === "number") {
        total += val;
        count += 1;
      }
    }
    if (count > 0) {
      avgRatings[cat] = total / count;
    } else {
      avgRatings[cat] = restaurant.ratings[cat];
    }
  }
  for (const key of categories) {
    const item = document.createElement("div");
    item.className = "rating-summary-item";
    const valueSpan = document.createElement("span");
    valueSpan.className = "value";
    valueSpan.textContent = avgRatings[key].toFixed(1);
    const labelSpan = document.createElement("span");
    labelSpan.className = "label";
    labelSpan.textContent = key.charAt(0).toUpperCase() + key.slice(1);
    item.appendChild(valueSpan);
    item.appendChild(labelSpan);
    summary.appendChild(item);
  }
  // Comments
  const commentsEl = document.getElementById("comments");
  commentsEl.innerHTML = "";
  for (const comment of restaurant.comments) {
    const commentDiv = document.createElement("div");
    commentDiv.className = "comment";
    // header (user and date)
    const headerDiv = document.createElement("div");
    headerDiv.className = "comment-header";
    // Left side: user and date
    const userDateSpan = document.createElement("span");
    userDateSpan.className = "comment-user-date";
    userDateSpan.textContent = `${comment.user} • ${comment.date}`;
    headerDiv.appendChild(userDateSpan);
    // Right side: status badges (verification and issue status)
    const statusContainer = document.createElement("span");
    statusContainer.className = "status-container";
    // Verification badge
    if (comment.verified) {
      const verBadge = document.createElement("span");
      verBadge.className = "badge badge-verified";
      verBadge.textContent = "Verified";
      statusContainer.appendChild(verBadge);
    } else {
      const unverBadge = document.createElement("span");
      unverBadge.className = "badge badge-unverified";
      unverBadge.textContent = "Unverified";
      statusContainer.appendChild(unverBadge);
    }
    // Issue status badge
    const issueBadge = document.createElement("span");
    issueBadge.className = "badge badge-issue";
    issueBadge.textContent =
      comment.issueStatus && comment.issueStatus === "resolved"
        ? "Resolved"
        : "Unresolved";
    // Apply different class for resolved/unresolved for styling
    if (comment.issueStatus === "resolved") {
      issueBadge.classList.add("resolved");
    } else {
      issueBadge.classList.add("unresolved");
    }
    statusContainer.appendChild(issueBadge);
    headerDiv.appendChild(statusContainer);
    commentDiv.appendChild(headerDiv);
    // ratings
    const ratingsRow = document.createElement("div");
    ratingsRow.className = "comment-ratings";
    for (const key of ["price", "quality", "service", "ambience", "menu"]) {
      const item = document.createElement("div");
      item.className = "rating-item";
      const smile = document.createElement("span");
      smile.textContent = getSmileyFromRating(comment.ratings[key]);
      const label = document.createElement("span");
      label.textContent = key.charAt(0).toUpperCase();
      item.appendChild(smile);
      item.appendChild(label);
      ratingsRow.appendChild(item);
    }
    commentDiv.appendChild(ratingsRow);
    // body
    const bodyP = document.createElement("div");
    bodyP.className = "comment-body";
    bodyP.textContent = comment.text;
    commentDiv.appendChild(bodyP);

    // Actions: allow marking the issue as resolved (for demonstration)
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "comment-actions";
    // Only show resolve button if issue unresolved
    if (!comment.issueStatus || comment.issueStatus !== "resolved") {
      const resolveButton = document.createElement("button");
      resolveButton.className = "resolve-btn";
      resolveButton.textContent = "Mark issue resolved";
      resolveButton.addEventListener("click", () => {
        // Update the badge text and styling in the UI
        issueBadge.textContent = "Resolved";
        issueBadge.classList.remove("unresolved");
        issueBadge.classList.add("resolved");
        // In a real application, this would send a request to the server
        // to update the comment status.  Here we simply display feedback.
        alert("Issue marked as resolved. Thank you for confirming!");
        resolveButton.disabled = true;
      });
      actionsDiv.appendChild(resolveButton);
    }
    commentDiv.appendChild(actionsDiv);
    commentsEl.appendChild(commentDiv);
  }
  // Add link to recommendation page
  const addBtn = document.getElementById("add-recommendation-btn");
  addBtn.href = `add_recommendation.html?id=${restaurant.id}`;
}

/* Add recommendation page logic */
function initAddRecommendationPage() {
  const params = getQueryParams();
  const restaurantSelect = document.getElementById("restaurant-select");
  // Populate restaurant options
  for (const restaurant of window.FOOD_DATA) {
    const opt = document.createElement("option");
    opt.value = restaurant.id;
    opt.textContent = restaurant.name;
    restaurantSelect.appendChild(opt);
  }
  // Preselect if id param provided
  if (params.id) {
    restaurantSelect.value = params.id;
  }
  // Handle rating selection
  // Order of categories matches the markup in add_recommendation.html: Price, Quality, Service, Menu, Ambience
  const ratingCategories = ["price", "quality", "service", "menu", "ambience"];
  for (const category of ratingCategories) {
    const container = document.getElementById(`${category}-smileys`);
    // Use literal characters for sad, neutral and happy faces.  Unicode
    // escape sequences for emoji above U+FFFF require surrogate pairs,
    // which are error‑prone; embedding the characters directly avoids
    // encoding issues.
    const smiles = ["☹", "😐", "☺"];
    for (let i = 0; i < smiles.length; i++) {
      const span = document.createElement("span");
      span.className = "smiley";
      span.textContent = smiles[i];
      span.dataset.value = i + 1; // values 1–3
      span.addEventListener("click", function () {
        // Remove selected from siblings
        const siblings = container.querySelectorAll(".smiley");
        siblings.forEach((sib) => sib.classList.remove("selected"));
        // Mark this one selected
        this.classList.add("selected");
        // Store value in hidden input
        const hidden = document.getElementById(`${category}-rating`);
        hidden.value = this.dataset.value;
      });
      container.appendChild(span);
    }
  }
  // Handle form submission
  const form = document.getElementById("recommendation-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    console.log("Submitted recommendation:", data);
    alert(
      "Thank you for your recommendation! Since this is a prototype, your data is printed in the console."
    );
    form.reset();
    // Remove selected classes on smileys
    document.querySelectorAll(".smiley").forEach((el) => el.classList.remove("selected"));
  });

  // Handle geolocation capture
  const locationBtn = document.getElementById("get-location");
  if (locationBtn) {
    locationBtn.addEventListener("click", () => {
      const statusDiv = document.getElementById("location-status");
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        statusDiv.textContent = "Geolocation is not supported by your browser.";
        return;
      }
      statusDiv.textContent = "Obtaining your location…";
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Store coords as comma separated string
          document.getElementById("location-coords").value = `${latitude},${longitude}`;
          statusDiv.textContent = `Location captured at latitude ${latitude.toFixed(
            5
          )}, longitude ${longitude.toFixed(5)}`;
          console.log("User location:", latitude, longitude);
        },
        (error) => {
          statusDiv.textContent = "Unable to retrieve your location.";
          console.error(error);
        }
      );
    });
  }
}

/* Moderation dashboard page logic */
function initModerationPage() {
  const listEl = document.getElementById("moderation-list");
  listEl.innerHTML = "";
  // Gather unresolved comments across all restaurants
  const unresolved = [];
  for (const restaurant of window.FOOD_DATA) {
    for (const comment of restaurant.comments) {
      if (!comment.issueStatus || comment.issueStatus !== "resolved") {
        unresolved.push({
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          comment,
        });
      }
    }
  }
  if (unresolved.length === 0) {
    const msg = document.createElement("p");
    msg.textContent = "There are currently no unresolved reviews.";
    listEl.appendChild(msg);
    return;
  }
  for (const item of unresolved) {
    const { restaurantId, restaurantName, comment } = item;
    const entry = document.createElement("div");
    entry.className = "comment";
    // header with restaurant and commenter
    const header = document.createElement("div");
    header.className = "comment-header";
    const left = document.createElement("span");
    left.textContent = `${restaurantName} – ${comment.user} • ${comment.date}`;
    header.appendChild(left);
    const statusContainer = document.createElement("span");
    statusContainer.className = "status-container";
    // verification badge
    const verBadge = document.createElement("span");
    verBadge.className = `badge ${comment.verified ? "badge-verified" : "badge-unverified"}`;
    verBadge.textContent = comment.verified ? "Verified" : "Unverified";
    statusContainer.appendChild(verBadge);
    // issue status badge
    const issueBadge = document.createElement("span");
    issueBadge.className = "badge badge-issue unresolved";
    issueBadge.textContent = "Unresolved";
    statusContainer.appendChild(issueBadge);
    header.appendChild(statusContainer);
    entry.appendChild(header);
    // body text
    const body = document.createElement("div");
    body.className = "comment-body";
    body.textContent = comment.text;
    entry.appendChild(body);
    // action button
    const actions = document.createElement("div");
    actions.className = "comment-actions";
    const button = document.createElement("button");
    button.className = "resolve-btn";
    button.textContent = "Mark as resolved";
    button.addEventListener("click", () => {
      issueBadge.textContent = "Resolved";
      issueBadge.classList.remove("unresolved");
      issueBadge.classList.add("resolved");
      button.disabled = true;
      alert("Review marked as resolved. In a full app this would save the change.");
    });
    actions.appendChild(button);
    entry.appendChild(actions);
    listEl.appendChild(entry);
  }
}

/* Home page logic: compute metrics and populate quick search and popular areas */
function initHomePage() {
  // Compute metrics
  const totalRestaurants = window.FOOD_DATA.length;
  let totalReviews = 0;
  let verifiedCount = 0;
  for (const restaurant of window.FOOD_DATA) {
    totalReviews += restaurant.comments.length;
    for (const comment of restaurant.comments) {
      if (comment.verified) verifiedCount++;
    }
  }
  const verifiedPct = totalReviews > 0 ? Math.round((verifiedCount / totalReviews) * 100) : 0;
  // Update metrics display
  const restaurantsEl = document.getElementById("metric-restaurants");
  const reviewsEl = document.getElementById("metric-reviews");
  const verifiedEl = document.getElementById("metric-verified");
  if (restaurantsEl) restaurantsEl.textContent = totalRestaurants;
  if (reviewsEl) reviewsEl.textContent = totalReviews;
  if (verifiedEl) verifiedEl.textContent = `${verifiedPct}%`;

  // Quick search categories – replicate categories from base44
  const categories = [
    { name: "Scottish", emoji: "🏴", type: "scottish" },
    { name: "Italian", emoji: "🍝", type: "italian" },
    { name: "Seafood", emoji: "🦞", type: "seafood" },
    { name: "Cafés", emoji: "☕", type: "cafe" },
    { name: "Fine Dining", emoji: "🍷", type: "fine_dining" },
    { name: "Pubs", emoji: "🍺", type: "pub" },
    { name: "Asian", emoji: "🍜", type: "thai,chinese,japanese,indian" },
    { name: "Vegetarian", emoji: "🥗", type: "vegetarian,vegan" },
  ];
  const catContainer = document.getElementById("quick-categories");
  if (catContainer) {
    catContainer.innerHTML = "";
    for (const cat of categories) {
      const link = document.createElement("a");
      link.className = "quick-card";
      link.href = `browse.html?type=${encodeURIComponent(cat.type)}`;
      // Emoji
      const emojiSpan = document.createElement("span");
      emojiSpan.className = "emoji";
      emojiSpan.textContent = cat.emoji;
      link.appendChild(emojiSpan);
      // Name
      const nameSpan = document.createElement("span");
      nameSpan.className = "name";
      nameSpan.textContent = cat.name;
      link.appendChild(nameSpan);
      catContainer.appendChild(link);
    }
  }

  // Popular areas – use defined list and compute restaurant counts
  const areasContainer = document.getElementById("popular-areas");
  if (areasContainer) {
    areasContainer.innerHTML = "";
    for (const areaDef of AREA_DEFINITIONS) {
      const count = window.FOOD_DATA.filter((r) => r.area === areaDef.name).length;
      const cardLink = document.createElement("a");
      cardLink.href = `browse.html?area=${encodeURIComponent(areaDef.name)}`;
      cardLink.className = "area-card";
      // image
      const img = document.createElement("img");
      img.src = areaDef.image;
      img.alt = areaDef.name;
      cardLink.appendChild(img);
      // overlay and info
      const overlay = document.createElement("div");
      overlay.className = "overlay";
      cardLink.appendChild(overlay);
      const info = document.createElement("div");
      info.className = "area-info";
      const title = document.createElement("h3");
      title.textContent = areaDef.name;
      info.appendChild(title);
      const countSpan = document.createElement("span");
      countSpan.textContent = `${count} place${count === 1 ? "" : "s"}`;
      info.appendChild(countSpan);
      cardLink.appendChild(info);
      areasContainer.appendChild(cardLink);
    }
  }

  // Recent recommendations – compile a flat list of comments with metadata
  const allComments = [];
  for (const restaurant of window.FOOD_DATA) {
    for (const comment of restaurant.comments) {
      allComments.push({
        restaurantName: restaurant.name,
        restaurantId: restaurant.id,
        comment,
      });
    }
  }
  // Sort by date descending
  allComments.sort((a, b) => {
    const da = new Date(a.comment.date);
    const db = new Date(b.comment.date);
    return db - da;
  });
  const recent = allComments.slice(0, 4);
  const recContainer = document.getElementById("recent-recs-grid");
  if (recContainer) {
    recContainer.innerHTML = "";
    for (const item of recent) {
      const { restaurantName, comment } = item;
      const card = document.createElement("div");
      card.className = "recommend-card";
      // header
      const headerDiv = document.createElement("div");
      headerDiv.className = "header";
      // avatar with initial
      const avatarDiv = document.createElement("div");
      avatarDiv.className = "avatar";
      const initial = comment.user ? comment.user.charAt(0).toUpperCase() : "M";
      avatarDiv.textContent = initial;
      headerDiv.appendChild(avatarDiv);
      // user info
      const userInfo = document.createElement("div");
      userInfo.className = "user-info";
      const userNameEl = document.createElement("h4");
      userNameEl.textContent = comment.user || "Member";
      userInfo.appendChild(userNameEl);
      // meta: restaurant and date
      const metaDiv = document.createElement("div");
      metaDiv.className = "meta";
      // restaurant name with map pin emoji
      const restSpan = document.createElement("span");
      restSpan.innerHTML = `📍 ${restaurantName}`;
      metaDiv.appendChild(restSpan);
      // dot separator and date
      const dot = document.createElement("span");
      dot.textContent = "•";
      metaDiv.appendChild(dot);
      const dateSpan = document.createElement("span");
      // Format date as e.g. Aug 5
      const d = new Date(comment.date);
      const options = { month: "short", day: "numeric" };
      dateSpan.textContent = d.toLocaleDateString(undefined, options);
      metaDiv.appendChild(dateSpan);
      userInfo.appendChild(metaDiv);
      headerDiv.appendChild(userInfo);
      // verified badge
      if (comment.verified) {
        const verifyBadge = document.createElement("span");
        verifyBadge.className = "verify-badge";
        verifyBadge.textContent = "✓ Verified";
        headerDiv.appendChild(verifyBadge);
      }
      card.appendChild(headerDiv);
      // review text
      const textDiv = document.createElement("div");
      textDiv.className = "review-text";
      textDiv.textContent = comment.text;
      card.appendChild(textDiv);
      // ratings row: use categories
      const ratingsRow = document.createElement("div");
      ratingsRow.className = "ratings-row";
      // Map rating keys to labels (Quality, Value, Service)
      const mapKeys = {
        quality: "Quality",
        price: "Value",
        service: "Service",
      };
      for (const key of ["quality", "price", "service"]) {
        const span = document.createElement("span");
        const label = document.createElement("span");
        label.textContent = `${mapKeys[key]}:`;
        const valueSpan = document.createElement("span");
        valueSpan.textContent = getSmileyFromRating(comment.ratings[key]);
        span.appendChild(label);
        span.appendChild(valueSpan);
        ratingsRow.appendChild(span);
      }
      card.appendChild(ratingsRow);
      recContainer.appendChild(card);
    }
  }
}

/* Helper to convert rating (1–5) to a simple smiley.  For the prototype
 * we map ratings <= 2.5 to ☹ (sad), 2.5–4 to 😐 (neutral), and > 4 to ☺ (happy).
 */
function getSmileyFromRating(value) {
  if (value <= 2.5) return "☹";
  if (value <= 4) return "😐";
  return "☺";
}

// Definitions of Edinburgh areas with descriptions and optional images.
const AREA_DEFINITIONS = [
  {
    name: "Old Town",
    description:
      "As the historic heart of Edinburgh and a UNESCO World Heritage Site, the Old Town is defined by its medieval architecture and cobblestone streets.  The Royal Mile runs from Edinburgh Castle at the top to the Palace of Holyroodhouse at the bottom.  The Grassmarket, a lively area of pubs and shops with views of the castle, and the underground vaults are also key parts of the Old Town.",
    image: "images/coffee_corner.jpg",
  },
  {
    name: "New Town",
    description:
      "Another UNESCO World Heritage Site, the New Town is famed for its elegant Georgian architecture, wide streets and squares.  It is separated from the Old Town by Princes Street Gardens.  Princes Street is the main shopping street, offering excellent views of the castle, while George Street features a wide selection of upscale shops, restaurants and cocktail bars.",
    image: "images/coffee_corner.jpg",
  },
  {
    name: "Leith",
    description:
      "This historic port district has transformed into one of Edinburgh's most vibrant and creative neighbourhoods.  The waterfront is lined with cosmopolitan restaurants, bars and the Royal Yacht Britannia.",
    image: "images/seafood_bistro.jpg",
  },
  {
    name: "West End",
    description:
      "A bohemian and cultural hub known for its art venues, independent boutiques and Georgian architecture.  It connects to the Haymarket area, a transport hub.",
    image: "images/placeholder.jpg",
  },
  {
    name: "Southside",
    description:
      "Located near the University of Edinburgh, this area has a large student population, creating a lively atmosphere with many independent shops, cafés and pubs.  The Meadows, a large public park, is a central feature.",
    image: "images/placeholder.jpg",
  },
  {
    name: "Stockbridge",
    description:
      "Situated north of the city centre, this area retains a distinct village feel with a laid‑back, bohemian charm.  It features independent boutiques, cafés and the popular Sunday market.",
    image: "images/placeholder.jpg",
  },
  {
    name: "Portobello",
    description:
      "Known as Edinburgh's seaside suburb, this area on the eastern edge of the city offers a relaxed, coastal lifestyle with a sandy beach and promenade.",
    image: "images/placeholder.jpg",
  },
  {
    name: "Morningside",
    description:
      "An affluent neighbourhood south of the city centre with a mix of Victorian and Edwardian housing.  Known for its peaceful, leafy streets and independent shops, it is particularly popular with families.",
    image: "images/placeholder.jpg",
  },
  {
    name: "Marchmont",
    description:
      "A popular residential neighbourhood for students due to its proximity to the University of Edinburgh.  It is separated from the Old Town by The Meadows park.",
    image: "images/placeholder.jpg",
  },
  {
    name: "Corstorphine",
    description:
      "A family‑friendly suburban area to the west, known for its community feel and green spaces, and home to Edinburgh Zoo.",
    image: "images/placeholder.jpg",
  },
  {
    name: "Gorgie",
    description:
      "Located in the southwest, this working‑class residential area offers a more down‑to‑earth atmosphere.",
    image: "images/placeholder.jpg",
  },
  {
    name: "Bruntsfield",
    description:
      "Neighbourhood adjacent to Morningside with cafés and independent shops, known for its leafy streets and family‑friendly vibe.",
    image: "images/placeholder.jpg",
  },
];

// Group definitions mapping area names into themed sections.  These
// groupings mirror the way locals describe Edinburgh’s neighbourhoods.
const AREA_GROUPS = [
  {
    title: "Central areas",
    description:
      "The historic heart of Edinburgh encompasses the UNESCO‑listed Old Town and New Town, along with the cultural West End and student‑filled Southside.",
    areas: ["Old Town", "New Town", "West End", "Southside"],
  },
  {
    title: "North & East",
    description:
      "To the north and east you’ll find the bustling port of Leith, the village‑like charm of Stockbridge and the seaside suburb of Portobello.",
    areas: ["Leith", "Stockbridge", "Portobello"],
  },
  {
    title: "South & West",
    description:
      "South of the centre lie leafy residential districts such as Morningside, Marchmont, Bruntsfield and Corstorphine, while to the southwest Gorgie offers a more down‑to‑earth vibe.",
    areas: ["Morningside", "Marchmont", "Bruntsfield", "Corstorphine", "Gorgie"],
  },
];

/**
 * Render the Areas page.  This function builds sections for each
 * defined group, listing all areas within that group along with
 * descriptions and the number of restaurants in our sample data.  If
 * the group contains an area that has no explicit definition, a
 * placeholder card will still be displayed.
 */
function initAreasPage() {
  const container = document.getElementById("area-groups-container");
  if (!container) return;
  container.innerHTML = "";
  for (const group of AREA_GROUPS) {
    const section = document.createElement("section");
    section.className = "area-group";
    const heading = document.createElement("h3");
    heading.className = "area-group-title";
    heading.textContent = group.title;
    section.appendChild(heading);
    const desc = document.createElement("p");
    desc.className = "area-group-desc";
    desc.textContent = group.description;
    section.appendChild(desc);
    // container for cards
    const cardsDiv = document.createElement("div");
    cardsDiv.className = "area-group-cards";
    for (const areaName of group.areas) {
      const def = AREA_DEFINITIONS.find((a) => a.name === areaName) || {
        name: areaName,
        description: "",
        image: "images/placeholder.jpg",
      };
      const count = window.FOOD_DATA.filter((r) => r.area === areaName).length;
      const card = document.createElement("a");
      card.className = "area-detail-card";
      card.href = `browse.html?area=${encodeURIComponent(areaName)}`;
      // Title
      const titleEl = document.createElement("h4");
      titleEl.textContent = def.name;
      card.appendChild(titleEl);
      // Description
      const descEl = document.createElement("p");
      descEl.textContent = def.description;
      card.appendChild(descEl);
      // Count of places
      const countEl = document.createElement("p");
      countEl.className = "count";
      countEl.textContent = `${count} place${count === 1 ? "" : "s"}`;
      card.appendChild(countEl);
      cardsDiv.appendChild(card);
    }
    section.appendChild(cardsDiv);
    container.appendChild(section);
  }
}