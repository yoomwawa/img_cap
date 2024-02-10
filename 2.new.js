const fs = require('fs').promises;
const path = require('path');

async function filterHotels() {
  try {
    const filePath = path.join(__dirname, '필리핀.json');
    const resultFilePath = path.join(__dirname, 'result.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const hotels = JSON.parse(data);

    console.log(`삭제 전 호텔 개수: ${hotels.length}`);

    const filteredHotels = hotels.filter((hotel) => {
      if (!hotel.hotel_name || !hotel.photo1 || !hotel.photo1.src) {
        console.log(
          `삭제된 호텔 ID: ${hotel.hotel_id}, 이유: ${
            !hotel.hotel_name ? 'hotel_name 없음' : 'photo1 없음'
          }`
        );
        return false;
      }
      return true;
    });

    console.log(`삭제 후 호텔 개수: ${filteredHotels.length}`);

    await fs.writeFile(resultFilePath, JSON.stringify(filteredHotels, null, 2));
    console.log('result.json 파일에 결과가 저장되었습니다.');
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

filterHotels();
