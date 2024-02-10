const fs = require('fs');
const path = require('path');

async function updateHotelScreens() {
  const jsonFilePath = path.join(__dirname, '프랑스.json');
  const resultFilePath = path.join(__dirname, 'result.json'); // 결과 파일 경로
  let data = fs.readFileSync(jsonFilePath, 'utf8');
  let hotels = JSON.parse(data);

  const totalHotels = hotels.length;
  const hotelsWithScreen1 = hotels.filter((hotel) => hotel.screen === 1).length;
  const hotelsWithScreen0OrUndefined = totalHotels - hotelsWithScreen1;

  console.log(`총 호텔 수: ${totalHotels}`);
  console.log(`Screen 값이 1인 호텔 수: ${hotelsWithScreen1}`);
  console.log(
    `Screen 값이 0이거나 없는 호텔 수: ${hotelsWithScreen0OrUndefined}`
  );

  // Screen 값이 1인 항목을 0으로 변경
  hotels.forEach((hotel) => {
    if (hotel.screen === 1) {
      hotel.screen = 0;
    }
  });

  // 변경된 데이터를 result.json 파일에 저장
  fs.writeFileSync(resultFilePath, JSON.stringify(hotels, null, 2));

  // 변경 후 Screen 값이 1인 호텔 수 확인
  const updatedHotelsWithScreen1 = hotels.filter(
    (hotel) => hotel.screen === 1
  ).length;
  console.log(`변경 후 Screen 값이 1인 호텔 수: ${updatedHotelsWithScreen1}`);
}

updateHotelScreens();
