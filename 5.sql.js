const fs = require('fs');

const jsonName = '필리핀'; // JSON 파일명
const tableName = 'philippine'; // SQL 테이블명
const jsonFileName = `${jsonName}.json`;
const sqlFileName = `${tableName}_dump.sql`;

fs.readFile(jsonFileName, 'utf8', (err, data) => {
  if (err) {
    console.error('파일을 읽는 도중 오류가 발생했습니다:', err);
    return;
  }

  const hotels = JSON.parse(data);
  const sqlStatements = hotels
    .map((hotel) => {
      const columns = Object.keys(hotel);
      const values = columns.map((key) => {
        let value = hotel[key];
        if (key === 'latitude' || key === 'longitude') {
          value = isNaN(parseFloat(value)) ? null : parseFloat(value);
        } else if (key === 'price' || key === 'review_count') {
          if (value === '' || value === '정보 없음' || value === '신규 호텔') {
            value = null;
          } else {
            value =
              key === 'price' ? value.replace(/,/g, '') : parseInt(value, 10);
          }
        }

        if (value === null) {
          return 'NULL';
        }

        if (typeof value === 'object') {
          return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
        } else {
          return typeof value === 'string'
            ? `'${value.replace(/'/g, "''")}'`
            : value;
        }
      });

      const onDuplicateUpdate = columns
        .map((key) => `${key} = VALUES(${key})`)
        .join(', ');

      return `INSERT INTO ${tableName} (${columns.join(
        ', '
      )}) VALUES (${values.join(', ')})
            ON DUPLICATE KEY UPDATE ${onDuplicateUpdate};`;
    })
    .join('\n');

  fs.writeFile(sqlFileName, sqlStatements, (err) => {
    if (err) {
      console.error('SQL 파일을 쓰는 도중 오류가 발생했습니다:', err);
    } else {
      console.log('SQL 파일이 성공적으로 생성되었습니다.');
    }
  });
});
