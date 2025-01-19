import fs from 'fs';
import path from 'path';
import url from 'url';
import fetch from 'node-fetch';
import maxmind from '@maxmind/geoip2-node';

// 获取当前脚本路径
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 输入 CSV 文件路径
const csvFilePath = path.resolve(__dirname, 'result.csv');
// 输出 TXT 文件路径
const txtFilegeo = path.resolve(__dirname, 'ip.txt');
// 地理位置
const geoipurl = 'https://raw.gitmirror.com/adysec/IP_database/main/geolite/GeoLite2-Country.mmdb'
// 提取列
let ip = 'IP 地址'
const speedtestresult = '下载速度 (MB/s)'
async function extractIpAndPort() {
  try {
    // 读取 CSV 文件内容
    const data = await fs.promises.readFile(csvFilePath, 'utf8');

    // 按行分割 CSV 内容
    const lines = data.split('\n').map(line => line.trim()).filter(line => line); // 去掉空行
    if (lines.length < 2) {
      throw new Error('CSV 文件内容不足或格式不正确');
    }

    // 获取表头
    const headers = lines[0].split(',');
    const ipIndex = headers.indexOf(ip);
    const speedIndex = headers.indexOf(speedtestresult);

    if (ipIndex === -1 || speedIndex === -1) {
      throw new Error(`CSV 文件缺少 ${ip} 或 ${speedtestresult} 列`);
    }

    // 读取 GeoLite2 数据库
    const response = await fetch(geoipurl);
    const arrayBuffer = await response.arrayBuffer();
    const dbBuffer = Buffer.from(arrayBuffer);
    const reader = maxmind.Reader.openBuffer(dbBuffer);
    const countryCounts = {};
    // 提取 IP 和端口
    const result = lines.slice(1) // 去掉表头
      .map(line => line.split(',')) // 按逗号分割每一行
      .filter(fields => fields.length > Math.max(ipIndex, speedIndex)) // 确保有足够的列
      .filter(fields => {
        const speedField = fields[speedIndex];
        if (speedField) {
          const speed = parseFloat(fields[speedIndex].replace(' kB/s', ''));
          return speed > 0; // 过滤下载速度大于 0 kB/s 的记录
        }
        return true
      })
      .map(fields => {
        ip = fields[ipIndex];
        const data = reader.country(ip);
        // 获取中文名称和国家代码
        const country = data.country.names['zh-CN'] || '未知';
        if (!countryCounts[country]) {
          countryCounts[country] = 0;
        }
        // 每个国家提取两个ip
        if (countryCounts[country] < 2) {
          countryCounts[country] += 1;
          return `${ip}:8443#${country}`;
        }
        return null;
      })
      .filter(ip => ip !== null)
      // 排序
      .sort((a, b) => {
        const countryA = a.split('#')[1];
        const countryB = b.split('#')[1];
        return countryA.localeCompare(countryB);
      })
      .join('\n'); // 合并成多行字符串

    // 写入到 TXT 文件
    await fs.promises.writeFile(txtFilegeo, result, 'utf8');
    console.log(`已成功提取到 ${txtFilegeo}`);
  } catch (error) {
    console.error('处理文件时发生错误:', error.message);
  }
}

extractIpAndPort();
