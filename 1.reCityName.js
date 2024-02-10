//본케 주
const fs = require('fs');

// 파일을 비동기적으로 읽는 함수
fs.readFile('호치민.json', 'utf8', (err, data) => {
  if (err) {
    console.error('파일을 읽는 도중 오류가 발생했습니다:', err);
    return;
  }

  // JSON 데이터를 객체로 변환
  let hotels = JSON.parse(data);
  let processedCount = 0;
  let failedHotels = [];
  let citySet = new Set();

  // 주소에서 첫 번째 한글 단어를 추출하는 함수
  function extractFirstKoreanWord(address) {
    const match = address.match(/[가-힣]+/);
    return match ? match[0] : null;
  }

  // 각 호텔 데이터에 대해 도시 값을 업데이트하고 도시 이름을 Set에 추가
  hotels.forEach((hotel) => {
    const firstKoreanWord = extractFirstKoreanWord(hotel.address);
    if (firstKoreanWord) {
      hotel.city = firstKoreanWord;
      processedCount++;
      citySet.add(firstKoreanWord);
    } else {
      // 변환에 실패한 호텔의 아이디를 배열에 추가
      failedHotels.push(hotel.hotel_id);
    }
  });

  // 실패한 호텔을 제외하고 새 배열 생성
  hotels = hotels.filter((hotel) => !failedHotels.includes(hotel.hotel_id));

  // 처리된 호텔 수, 총 호텔 수, 변환 실패한 호텔의 아이디를 로그로 출력
  console.log(
    `총 호텔 수: ${hotels.length}, 처리된 호텔 수: ${processedCount}`
  );
  console.log(`도시 목록: ${Array.from(citySet).join(', ')}`);
  if (failedHotels.length > 0) {
    console.log(`변환에 실패한 호텔 아이디: ${failedHotels.join(', ')}`);
  } else {
    console.log('모든 호텔의 변환이 성공적으로 이루어졌습니다.');
  }

  // 수정된 데이터를 새 파일로 저장
  fs.writeFile(
    'result.json',
    JSON.stringify(hotels, null, 2),
    'utf8',
    (err) => {
      if (err) {
        console.error('파일을 저장하는 도중 오류가 발생했습니다:', err);
      } else {
        console.log('result_bali.json 파일이 성공적으로 저장되었습니다.');
      }
    }
  );
});
