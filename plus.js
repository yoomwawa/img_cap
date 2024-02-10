const fs = require('fs').promises;
const path = require('path');

async function mergeHotelData() {
  try {
    const files = await fs.readdir(__dirname);
    const jsonFiles = files.filter((file) => file.endsWith('.json'));

    const allHotels = new Map();

    for (const file of jsonFiles) {
      const data = await fs.readFile(path.join(__dirname, file), 'utf-8');
      const hotels = JSON.parse(data);

      hotels.forEach((hotel) => {
        if (!allHotels.has(hotel.hotel_id)) {
          allHotels.set(hotel.hotel_id, hotel);
        }
      });
    }

    const mergedHotels = Array.from(allHotels.values());
    console.log(`총 저장된 호텔 개수: ${mergedHotels.length}`);

    await fs.writeFile(
      path.join(__dirname, 'result.json'),
      JSON.stringify(mergedHotels, null, 2)
    );
    console.log('result.json 파일에 결과가 저장되었습니다.');
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

mergeHotelData();
