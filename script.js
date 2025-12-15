const wrapper = document.querySelector('.wrapper');
const loginLink = document.querySelector('.login-link');
const registerLink = document.querySelector('.register-link');
const btnPopup = document.querySelector('.btnLogin-popup');
const iconClose = document.querySelector('.icon-close');

document.addEventListener('DOMContentLoaded', () => {
  const eventsPopup = document.querySelector(".events-popup");
  const eventsClose = document.querySelector(".events-close");

  const eventInfo = document.querySelector(".event-info");
  const eventImg = document.getElementById("event-img");
  const eventTitle = document.getElementById("event-title");
  const eventLocation = document.getElementById("event-location");
  const eventTime = document.getElementById("event-time");
  const eventDesc = document.getElementById("event-desc");
  const btnDirections = document.getElementById("btn-directions");

  const eventsMapDiv = document.getElementById("events-map");

  const eventData = [
  {
    id: 1,
    title: "Community Food Sharing",
    location: "Taoyuan Public Park",
    time: "Dec 20, 2025, 10:00 AM - 2:00 PM",
    desc: "Join us to share and enjoy free food with the community.",
    img: "https://plus.unsplash.com/premium_photo-1754341357839-a11120163778?",
    lat: 24.993,
    lng: 121.296
  },
  {
    id: 2,
    title: "Clothes Exchange Day",
    location: "Zhongli Cultural Center",
    time: "Jan 10, 2026, 9:00 AM - 5:00 PM",
    desc: "Bring your gently used clothes and swap with others.",
    img: "https://plus.unsplash.com/premium_photo-1676587710768-3c36f6aa9fdd?",
    lat: 24.995,
    lng: 121.300
  },
  {
    id: 3,
    title: "Book Donation Drive",
    location: "Taoyuan Library",
    time: "Feb 5, 2026, 8:00 AM - 4:00 PM",
    desc: "Donate your old books and help build a community library.",
    img: "https://images.unsplash.com/photo-1591171550305-7faf12e39a27?",
    lat: 24.996,
    lng: 121.298
  },
  {
    id: 4,
    title: "Spring Gardening Workshop",
    location: "Yangmei Community Garden",
    time: "Mar 15, 2026, 1:00 PM - 4:00 PM",
    desc: "Learn how to plant and care for your own garden.",
    img: "https://plus.unsplash.com/premium_photo-1679504029329-0dfac5d2d0e5?",
    lat: 24.990,
    lng: 121.310
  },
  {
    id: 5,
    title: "Sustainable Living Seminar",
    location: "Bade Eco Center",
    time: "Apr 22, 2026, 10:00 AM - 3:00 PM",
    desc: "Discover tips and tricks to live a greener lifestyle.",
    img: "https://plus.unsplash.com/premium_vector-1737389670154-190c67b94837?",
    lat: 24.988,
    lng: 121.305
  },
  {
    id: 6,
    title: "Toy Donation Drive",
    location: "Taoyuan Sports Complex",
    time: "May 10, 2026, 7:00 AM - 12:00 PM",
    desc: "Donate your old toys for orphan houses",
    img: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?",
    lat: 24.994,
    lng: 121.299
  },
  {
    id: 7,
    title: "Art & Culture Fair",
    location: "Taoyuan Art Center",
    time: "Jun 5, 2026, 11:00 AM - 6:00 PM",
    desc: "Celebrate local art and culture with exhibitions and workshops.",
    img: "https://images.unsplash.com/photo-1740049348201-608314a9f047?",
    lat: 24.992,
    lng: 121.302
  }
];

  let eventsMap;
  let markers = [];

  function initEventsMap() {
    if (eventsMap) {
      eventsMap.remove();
      eventsMap = null;
      markers = [];
    }
    eventsMap = L.map("events-map").setView([24.99, 121.30], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(eventsMap);

    eventData.forEach(event => {
      const marker = L.marker([event.lat, event.lng]).addTo(eventsMap);

      marker.on("click", () => {
        showEventInfo(event);
        eventsMap.setView([event.lat, event.lng], 15);
      });

      markers.push(marker);
    });
  }

  function showEventInfo(event) {
    eventImg.src = event.img;
    eventImg.alt = event.title;
    eventTitle.textContent = event.title;
    eventLocation.textContent = event.location;
    eventTime.textContent = event.time;
    eventDesc.textContent = event.desc;

    eventInfo.style.display = "block";
  }

  const openEventsBtn = document.getElementById("events-btn");
  if (openEventsBtn) {
    openEventsBtn.addEventListener("click", () => {
      eventsPopup.style.display = "flex";
      eventInfo.style.display = "none";
      initEventsMap();
    });
  }

  eventsClose.addEventListener("click", () => {
    eventsPopup.style.display = "none";
    if (eventsMap) {
      eventsMap.remove();
      eventsMap = null;
      eventInfo.style.display = "none";
    }
  });

  eventsPopup.addEventListener("click", (e) => {
    if (e.target === eventsPopup) {
      eventsPopup.style.display = "none";
      if (eventsMap) {
        eventsMap.remove();
        eventsMap = null;
        eventInfo.style.display = "none";
      }
    }
  });
  let currentEvent = null;

function showEventInfo(event) {
  currentEvent = event; // Lưu sự kiện hiện tại
  eventImg.src = event.img;
  eventImg.alt = event.title;
  eventTitle.textContent = event.title;
  eventLocation.textContent = event.location;
  eventTime.textContent = event.time;
  eventDesc.textContent = event.desc;

  eventInfo.style.display = "block";
}

// Xử lý nút directions
btnDirections.addEventListener('click', () => {
  if (!currentEvent) return alert("Please select an event first!");

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      // Mở Google Maps directions từ vị trí người dùng đến sự kiện
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${currentEvent.lat},${currentEvent.lng}&travelmode=walking`;
      window.open(directionsUrl, '_blank');
    }, () => {
      alert("Unable to retrieve your location.");
    });
  } else {
    alert("Geolocation is not supported by your browser.");
  }
});

});



registerLink.addEventListener('click', ()=> {
    wrapper.classList.add('active');
});

loginLink.addEventListener('click', ()=> {
    wrapper.classList.remove('active');
});

btnPopup.addEventListener('click', ()=> {
    wrapper.classList.add('active-popup');
});

iconClose.addEventListener('click', ()=> {
    wrapper.classList.remove('active-popup');
});

// ===== NEW ABOUT US POPUP =====
const aboutUsLink = document.getElementById('about-btn');
const aboutPopup = document.querySelector('.about-popup');
const aboutCloseBtn = document.querySelector('.about-close');

aboutUsLink.addEventListener('click', (e) => {
    e.preventDefault(); // prevent default anchor behavior
    aboutPopup.classList.add('active');
});

aboutCloseBtn.addEventListener('click', () => {
    aboutPopup.classList.remove('active');
});

// Close About Us popup when clicking outside the box
aboutPopup.addEventListener('click', (e) => {
    if (e.target === aboutPopup) {
        aboutPopup.classList.remove('active');
    }
});

// --- Services popup ---
document.addEventListener("DOMContentLoaded", () => {

  const popup = document.querySelector(".services-popup");
  const closeBtn = document.querySelector(".services-close");
  const catBtns = document.querySelectorAll(".cat-btn");
  const grid = document.getElementById("items-grid");

  const detailBox = document.getElementById("item-detail");
  const dImg = document.getElementById("detail-img");
  const dName = document.getElementById("detail-name");
  const dDesc = document.getElementById("detail-desc");
  const dStatus = document.getElementById("detail-status");
  const dArea = document.getElementById("detail-area");
  const dDonor = document.getElementById("detail-donor");

  /* STATIC DATA */
  const data = {
    food: [
      {name:"Bread Pack", img:"https://images.unsplash.com/photo-1598373182133-52452f7691ef?", desc:"Fresh bakery items", status:"Available", area:"Taoyuan", donor:"Student A"},
      {name:"Lunch Box", img:"https://plus.unsplash.com/premium_photo-1667389723440-dbbde959df52?", desc:"Homemade lunch", status:"Available", area:"Zhongli", donor:"Student B"},
      {name:"Snacks", img:"https://images.unsplash.com/photo-1566478989037-eec170784d0b?", desc:"Unopened snacks", status:"Available", area:"Pingzhen", donor:"Student C"},
      {name:"Fruits", img:"https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?", desc:"Seasonal fruits", status:"Available", area:"Taoyuan", donor:"Student D"}
    ],
      books: [
      { name: "English Grammar Book", img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?", desc: "Useful for ESL learners", status: "Available", area: "Taoyuan", donor: "Student I" },
      { name: "Math Textbook", img: "https://images.unsplash.com/photo-1676302447092-14a103558511?", desc: "High school level", status: "Available", area: "Zhongli", donor: "Student J" },
      { name: "Novel Collection", img: "https://images.unsplash.com/photo-1663868290007-e8df80a5b909?", desc: "Light reading", status: "Good", area: "Pingzhen", donor: "Student K" },
      { name: "Children Books", img: "https://images.unsplash.com/photo-1455884981818-54cb785db6fc?", desc: "For kids", status: "Good", area: "Taoyuan", donor: "Student L" }
    ],

    clothes: [
      {name:"Man Jacket", img:"https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?", desc:"Winter jacket", status:"Good", area:"Zhongli", donor:"Student E"},
      {name:"T-shirt", img:"https://images.unsplash.com/photo-1716541424893-734612ddcabb?", desc:"Casual wear", status:"Good", area:"Taoyuan", donor:"Student F"},
      {name:"Jeans", img:"https://images.unsplash.com/photo-1604176354204-9268737828e4?", desc:"Size M", status:"Good", area:"Pingzhen", donor:"Student G"},
      {name:"Kid Dress", img:"https://images.unsplash.com/photo-1700751616466-7aa544a46077?", desc:"Light dress", status:"Good", area:"Zhongli", donor:"Student H"}
    ],
    furniture: [
    {name:"Study Desk", img:"https://plus.unsplash.com/premium_photo-1664297827889-5cc99441cada?", desc:"Wooden desk", status:"Used", area:"Zhongli", donor:"Student M"},
    {name:"Office Chair", img:"https://images.unsplash.com/photo-1688578735427-994ecdea3ea4?", desc:"Comfortable chair", status:"Good", area:"Taoyuan", donor:"Student N"},
    {name:"Bookshelf", img:"https://images.unsplash.com/photo-1622371729389-f18a9d26a84a?", desc:"3-layer shelf", status:"Good", area:"Pingzhen", donor:"Student O"},
    {name:"Small Table", img:"https://plus.unsplash.com/premium_photo-1670869816899-16fe9c7b8cfb?", desc:"Multi-purpose table", status:"Used", area:"Zhongli", donor:"Student P"}
  ],

  household: [
    {name:"Rice Cooker", img:"https://images.unsplash.com/photo-1599182345361-9542815e73f6?", desc:"Working well", status:"Used", area:"Taoyuan", donor:"Student Q"},
    {name:"Electric Fan", img:"https://images.unsplash.com/photo-1759339206229-b10e61dd9089?", desc:"Strong wind", status:"Good", area:"Zhongli", donor:"Student R"},
    {name:"Kitchen Set", img:"https://images.unsplash.com/photo-1760269734155-b6bb8c41dad6?", desc:"Pots & pans", status:"Good", area:"Pingzhen", donor:"Student S"},
    {name:"Laundry Basket", img:"https://images.unsplash.com/photo-1582735689369-4fe89db7114c?", desc:"Plastic basket", status:"Good", area:"Taoyuan", donor:"Student T"}
  ],

  others: [
    {name:"Backpack", img:"https://plus.unsplash.com/premium_photo-1723649902661-216596f2ac1a?", desc:"School backpack", status:"Good", area:"Zhongli", donor:"Student U"},
    {name:"Stationery Set", img:"https://plus.unsplash.com/premium_photo-1723481535716-a026ff39957a?", desc:"Pens & notebooks", status:"Available", area:"Taoyuan", donor:"Student V"},
    {name:"Umbrella", img:"https://images.unsplash.com/photo-1514882651048-f09572b0233e?", desc:"Foldable umbrella", status:"Good", area:"Pingzhen", donor:"Student W"},
    {name:"Water Bottle", img:"https://plus.unsplash.com/premium_photo-1664527307281-faf42c09ac8f?", desc:"Reusable bottle", status:"Good", area:"Zhongli", donor:"Student X"}
  ]
  };

  function loadItems(cat) {
    grid.innerHTML = "";
    detailBox.classList.add("hidden");

    data[cat].forEach(item => {
      const div = document.createElement("div");
      div.className = "item-card";
      div.innerHTML = `
        <img src="${item.img}">
        <h4>${item.name}</h4>
      `;
      div.onclick = () => showDetail(item);
      grid.appendChild(div);
    });
  }

  function showDetail(item) {
    detailBox.classList.remove("hidden");
    dImg.src = item.img;
    dName.textContent = item.name;
    dDesc.textContent = item.desc;
    dStatus.textContent = item.status;
    dArea.textContent = item.area;
    dDonor.textContent = item.donor;
  }

  catBtns.forEach(btn => {
    btn.onclick = () => {
      catBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      loadItems(btn.dataset.cat);
    };
  });

  const servicesBtn = document.getElementById("services-btn");
  if (servicesBtn) {
    servicesBtn.addEventListener("click", (e) => {
      e.preventDefault();
      popup.style.display = "flex";
      loadItems("food");
    });
  }

  closeBtn.addEventListener("click", () => {
    popup.style.display = "none";
  });

  popup.addEventListener("click", (e) => {
    if (e.target === popup) popup.style.display = "none";
  });

});
