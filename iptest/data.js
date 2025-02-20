import fs from "fs";
import path from "path";
import url from "url";
import fetch from "node-fetch";
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 输出 TXT 文件路径
const txtFilegeo = path.resolve(__dirname, "data.txt");
async function getDatacenterMap() {
  const url = "https://speed.cloudflare.com/locations";

  try {
    const response = await fetch(url);
    const data = await response.json();

    const datacenterMap = {};

    data.forEach(({ iata, cca2 }) => {
      if (!datacenterMap[cca2]) {
        datacenterMap[cca2] = [];
      }
      datacenterMap[cca2].push(iata);
    });

    console.log(datacenterMap);
    await fs.promises.writeFile(
      txtFilegeo,
      JSON.stringify(datacenterMap, null, 2),
      "utf8",
    );
    console.log(`已成功提取到 ${txtFilegeo}`);
    return datacenterMap;
  } catch (error) {
    console.error("获取数据中心映射失败:", error);
  }
}

// 运行函数
getDatacenterMap();
