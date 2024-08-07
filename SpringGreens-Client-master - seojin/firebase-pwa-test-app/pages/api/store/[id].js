export default async function handler(req, res) {
  const { id } = req.query;
  
  try {
    const response = await fetch(`http://121.191.223.250:9090/api/map/get/products/map/${id}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching store data:', error);
    res.status(500).json({ error: 'Unable to fetch store data' });
  }
}