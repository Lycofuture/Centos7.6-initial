import fs from "fs";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";

async function getDatacenterMap() {
  console.log("开始获取 Cloudflare 数据中心位置...");

  try {
    const response = await fetch("https://speed.cloudflare.com/locations");
    const data = await response.json();

    console.log("成功获取 Cloudflare 数据中心数据，开始处理数据...");

    const datacenterMap = {};

    data.forEach(({ iata, cca2 }) => {
      if (!datacenterMap[cca2]) {
        datacenterMap[cca2] = [];
      }
      datacenterMap[cca2].push(iata);
    });

    console.log("数据中心映射创建成功。");
    await fs.promises.writeFile(
      "data.txt",
      JSON.stringify(datacenterMap, null, 2),
      "utf8",
    );
    console.log(`已成功将数据保存到 data.txt`);

    const extractedData = await extractData();

    console.log("开始修改数据中心映射...");
    const newDatacenterMap = await modifyDatacenterMap(
      extractedData,
      datacenterMap,
    );

    console.log("数据中心映射修改完成，开始保存到文件...");

    await fs.promises.writeFile(
      "data-cn.txt",
      JSON.stringify(newDatacenterMap, null, 2),
      "utf8",
    );

    console.log(`已成功将数据保存到 data-cn.txt`);
    return newDatacenterMap;
  } catch (error) {
    console.error("获取数据中心映射失败:", error);
  }
}

async function extractData() {
  console.log("开始提取政治实体和 ISO 代码数据...");

  try {
    // 读取 HTML 文件
    const response = await fetch("https://www.aqwu.net/wp/?p=1231");
    const htmlContent = await response.text();

    console.log("HTML 内容获取成功，开始解析...");

    // 解析 HTML
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // 获取表格
    const table = document.querySelector("table");
    if (!table) {
      console.error("未找到表格");
      return;
    }

    const rows = table.querySelectorAll("tr");

    // 获取表头列索引
    const headers = Array.from(rows[0].querySelectorAll("th")).map((th) =>
      th.textContent.trim(),
    );
    const politicalIndex = headers.indexOf("政治实体");
    const isoIndex = headers.indexOf("ISO 3166-1二位字母代码");

    if (politicalIndex === -1 || isoIndex === -1) {
      console.error("未找到正确的列索引");
      return;
    }

    console.log("表头列索引解析成功，开始提取数据...");

    // 提取数据
    const extractedData = {};
    rows.forEach((row, i) => {
      if (i === 0) return; // 跳过表头
      const columns = row.querySelectorAll("td");
      if (columns.length > Math.max(politicalIndex, isoIndex)) {
        const politicalEntity = columns[politicalIndex].textContent.trim();
        const isoCode = columns[isoIndex].textContent.trim();
        extractedData[isoCode] = politicalEntity; // 映射 ISO 代码到政治实体
      }
    });

    console.log("政治实体和 ISO 代码数据提取完成。");
    return extractedData;
  } catch (error) {
    console.error("发生错误:", error);
  }
}

// 修改 datacenterMap 的键
async function modifyDatacenterMap(extractedData, datacenterMap) {
  console.log("开始修改数据中心映射的键...");

  try {
    // 生成新的 datacenterMap
    let newDatacenterMap = {};

    Object.entries(datacenterMap).forEach(([isoCode, values]) => {
      const newKey = extractedData[isoCode] || isoCode; // 找到政治实体名称，找不到就用原键
      newDatacenterMap[newKey] = values; // 保持值不变
    });

    console.log("数据中心映射键修改完成。");
    return newDatacenterMap;
  } catch (error) {
    console.error("修改 datacenterMap 失败:", error);
  }
}

// 运行提取函数
await getDatacenterMap();
