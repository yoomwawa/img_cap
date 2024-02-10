const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const countryFolderPath = '.'; // 국가명 폴더를 현재 디렉토리로 설정
const batchSize = 100; // 한 번에 처리할 이미지 수

async function convertImages() {
  try {
    const newImageFiles = (await fs.readdir(countryFolderPath)).filter((file) =>
      file.endsWith('.png')
    );

    for (let i = 0; i < newImageFiles.length; i += batchSize) {
      const batch = newImageFiles.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (file, index) => {
          const current = i + index + 1; // 현재 처리 중인 이미지의 순번
          console.log(`이미지 변환 중: ${current} / ${newImageFiles.length}`);

          const sourcePath = path.join(countryFolderPath, file);
          const destinationPath = sourcePath.replace('.png', '.webp');

          await sharp(sourcePath).webp({ quality: 50 }).toFile(destinationPath);
          await fs.unlink(sourcePath);
        })
      );
    }

    console.log('모든 이미지의 변환 작업이 완료되었습니다.');
    await moveImages();
  } catch (error) {
    console.error('이미지 변환 중 오류가 발생했습니다:', error);
  }
}

async function moveImages() {
  try {
    const cityFolders = await fs.readdir(countryFolderPath);

    for (const cityFolder of cityFolders) {
      const cityFolderPath = path.join(countryFolderPath, cityFolder);
      const cityFolderStat = await fs.stat(cityFolderPath);

      if (cityFolderStat.isDirectory()) {
        const hotelFolders = await fs.readdir(cityFolderPath);

        for (const hotelFolder of hotelFolders) {
          const hotelFolderPath = path.join(cityFolderPath, hotelFolder);
          const hotelFolderStat = await fs.stat(hotelFolderPath);

          if (hotelFolderStat.isDirectory()) {
            const hotelFiles = (await fs.readdir(hotelFolderPath)).filter(
              (file) => file.endsWith('.png') || file.endsWith('.webp')
            );
            const hotelIds = hotelFiles
              .map((file) => extractHotelId(file))
              .filter((id) => id);

            const webpImageFiles = (await fs.readdir(countryFolderPath)).filter(
              (file) => file.endsWith('.webp')
            );

            for (const webpImageFile of webpImageFiles) {
              const imageId = extractHotelId(webpImageFile);

              if (hotelIds.includes(imageId)) {
                const sourcePath = path.join(countryFolderPath, webpImageFile);
                const destinationPath = path.join(
                  hotelFolderPath,
                  webpImageFile
                );
                await fs.copyFile(sourcePath, destinationPath);
                await fs.unlink(sourcePath); // 원본 .webp 파일 삭제
              }
            }
          }
        }
      }
    }

    console.log(`이미지 이동이 완료되었습니다.`);
  } catch (error) {
    console.error('이미지 이동 중 오류가 발생했습니다:', error);
  }
}

function extractHotelId(filename) {
  const match = filename.match(/(\d+)\.(webp|png)$/);
  return match ? match[1] : null;
}

convertImages();
