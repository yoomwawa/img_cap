const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const jsonFileName = '프랑스.json';

async function captureHotels() {
  const words = [
    // 추가된 20개의 단어
    'tranquility',
    'paradise',
    'elegance',
    'charm',
    'oasis',
    'bliss',
    'escape',
    'harmony',
    'splendor',
    'sanctuary',
  ];

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  const targetUrl = 'http://127.0.0.1:8080/screen.html';

  let hotelsData = JSON.parse(fs.readFileSync(jsonFileName, 'utf8'));

  const hotelsToCapture = hotelsData.filter((hotel) => hotel.screen !== 1);

  // 캡쳐해야 할 호텔이 없으면 로그를 출력하고 함수를 종료
  if (hotelsToCapture.length === 0) {
    console.log('더 이상 캡쳐할 호텔이 없습니다.');
    return;
  }

  console.log(`총 호텔 수: ${hotelsData.length}`);
  console.log(
    `이미 캡쳐된 호텔 수: ${hotelsData.length - hotelsToCapture.length}`
  );
  console.log(`캡쳐해야 할 호텔 수: ${hotelsToCapture.length}`);

  const BATCH_SIZE = 1; // 한 번에 처리할 호텔의 수

  await page.goto(targetUrl, { waitUntil: 'networkidle0' });

  let currentHotelIndex = 1;

  for (const hotel of hotelsToCapture) {
    console.log(
      `진행 중인 호텔: ${currentHotelIndex} / ${hotelsToCapture.length}`
    );

    await page.reload({ waitUntil: 'networkidle0' });

    const storedHotelId = await page.evaluate(() =>
      localStorage.getItem('currentHotelId')
    );
    // 로컬 스토리지에서 가져온 호텔 아이디를 로그로 출력
    console.log(`Stored Hotel ID from Local Storage: ${storedHotelId}`);

    const storedCountry = await page.evaluate(() =>
      localStorage.getItem('selectedCountry')
    );
    const storedCity = await page.evaluate(() =>
      localStorage.getItem('selectedCity')
    );
    const storedHotelName = await page.evaluate(() =>
      localStorage.getItem('selectedHotelName')
    );

    if (!storedHotelId || !storedCountry || !storedCity || !storedHotelName) {
      console.log(
        '로컬 스토리지에서 호텔 데이터가 누락되었습니다. 건너뛰고 있습니다...'
      );
      break;
    }

    const folderPath = path.join(
      __dirname,
      storedCountry,
      storedCity,
      storedHotelName
    );
    // 폴더 생성 시도
    try {
      fs.mkdirSync(folderPath, { recursive: true });
    } catch (error) {
      console.error(
        `Error creating folder for hotel: ${safeHotelName}. Skipping this hotel.`
      );
      continue; // 다음 호텔로 넘어감
    }

    await page.evaluate((hotelId) => {
      document.getElementById('header').setAttribute('data-hotel-id', hotelId);
    }, hotel.hotel_id);

    // 호텔 ID에 따른 헤더 이미지 파일 경로 설정 및 캡쳐
    const headerImagePath = path.join(
      folderPath,
      `header-${storedHotelId}.png`
    );
    if (!fs.existsSync(headerImagePath)) {
      const header = await page.$('#header');
      if (header) {
        await header.screenshot({ path: headerImagePath });
        console.log(`Captured: header-${storedHotelId}.png`);
      }
    }

    // 이미지 캡처 로직
    const images = await page.$$('.image-container img');
    for (let i = 0; i < images.length; i++) {
      try {
        // 이미지 파일 이름 설정
        const imageName = `${words[i % words.length]}-${storedHotelId}`;
        const imagePath = path.join(folderPath, `${imageName}.png`);
        const webpImagePath = path.join(folderPath, `${imageName}.webp`);

        // PNG 형식으로 이미지 캡쳐
        await images[i].screenshot({ path: imagePath });

        // PNG 이미지를 WebP 형식으로 변환
        await sharp(imagePath)
          .webp({ quality: 50 }) // 품질 설정 (0-100)
          .toFile(webpImagePath);

        // 원본 PNG 파일 삭제
        fs.unlinkSync(imagePath);

        console.log(`Captured and converted to WebP: ${imageName}`);
      } catch (error) {
        console.error(`이미지 처리 중 오류 발생 ${i + 1}: ${error}`);
      }
    }

    // 2초 대기 후 페이지 새로고침
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await page.reload({ waitUntil: 'networkidle0' });

    // 호텔 데이터 업데이트
    const hotelIndex = hotelsData.findIndex(
      (h) => h.hotel_id.toString() === storedHotelId
    );
    if (hotelIndex !== -1) {
      hotelsData[hotelIndex].screen = 1;
      fs.writeFileSync(jsonFileName, JSON.stringify(hotelsData, null, 2));
      console.log(
        `호텔 캡쳐 완료 및 데이터 업데이트: ${hotelsData[hotelIndex].hotel_translated_name} (${currentHotelIndex} / ${hotelsToCapture.length})`
      );
    }

    if (currentHotelIndex % BATCH_SIZE === 0) {
      console.log(`${BATCH_SIZE}개의 호텔 캡쳐 완료. 스크립트를 종료합니다.`);
      break;
    }

    currentHotelIndex++;
  }

  await browser.close();
}

captureHotels();
