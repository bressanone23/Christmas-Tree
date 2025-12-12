
export const LOGO_DATA = [
  { name: "Bridgewater", color: "#B1B3B3", textColor: "#000000" },
  { name: "Morgan Stanley", color: "#002E5D", textColor: "#FFFFFF" },
  { name: "Barclays", color: "#00AEEF", textColor: "#FFFFFF" },
  { name: "UBS", color: "#E60000", textColor: "#FFFFFF" },
  { name: "HRT", color: "#FF6600", textColor: "#FFFFFF" },
  { name: "Point72", color: "#005596", textColor: "#FFFFFF" },
  { name: "Goldman", color: "#7399C6", textColor: "#FFFFFF" },
  { name: "Millennium", color: "#003399", textColor: "#FFFFFF" },
  { name: "BAM", color: "#002855", textColor: "#FFFFFF" },
  { name: "Citadel", color: "#003366", textColor: "#FFFFFF" },
  { name: "Elliott", color: "#004422", textColor: "#FFFFFF" },
  { name: "Man Group", color: "#003366", textColor: "#FFFFFF" },
  { name: "Fidelity", color: "#12824C", textColor: "#FFFFFF" }
];

// Kept for compatibility if imported elsewhere, but largely superseded by LOGO_DATA
export const BRAND_COLORS = LOGO_DATA.map(l => l.color);

export const PARTICLE_COUNT = 900; 
export const AUDIO_URL = "https://upload.wikimedia.org/wikipedia/commons/e/e0/Jingle_Bells_-_Kevin_MacLeod_-_No_Copyright_Music.ogg";
