self.onmessage = function(e) {
  const { lat1, lon1, lat2, lon2 } = e.data;
  const distance = calculateDistance(lat1, lon1, Number(lat2), Number(lon2));
  self.postMessage(distance);
};

function calculateDistance(lat1, lon1, lat2, lon2) {
  console.log(typeof lat2, typeof lon2);
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  console.log(R * c);
  return R * c;
  
}