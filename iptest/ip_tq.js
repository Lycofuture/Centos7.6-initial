import fs from "fs";
import path from "path";
import url from "url";
import fetch from "node-fetch";
import { JSDOM } from "jsdom";
//每个国家提前数量
const shu = 5;
// 是否过滤下载速度
const speed = true;
// 过滤下载速度下限，单位kb/s
const test = 100;
// 获取当前脚本路径
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 输入 CSV 文件路径
const csvFilePath = path.resolve(__dirname, "ip_tq.csv");
// 输出 TXT 文件路径
const txtFilegeo = path.resolve(__dirname, "ip.txt");
// 提取列
const ip = "IP地址";
const port = "端口";
const speedtestresult = "下载速度";
const datacenter = "数据中心";
async function extractIpAndPort() {
  try {
    // 读取 CSV 文件内容
    console.log("开始读取 CSV 文件...");
    const data = await fs.promises.readFile(csvFilePath, "utf8");
    console.log("CSV 文件读取成功。");

    // 按行分割 CSV 内容
    const lines = data
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line); // 去掉空行
    if (lines.length < 2) {
      throw new Error("CSV 文件内容不足或格式不正确");
    }
    console.log("CSV 文件内容处理完成。");

    // 获取表头
    const headers = lines[0].split(",");
    const ipIndex = headers.indexOf(ip);
    const portIndex = headers.indexOf(port);
    const speedIndex = headers.indexOf(speedtestresult);
    const datacenterIndex = headers.indexOf(datacenter);

    if (ipIndex === -1 || portIndex === -1 || datacenterIndex === -1) {
      throw new Error(`CSV 文件缺少 ${ip}、${port} 或 ${datacenter} 列`);
    }
    console.log("CSV 文件列索引检查通过。");

    // 数据中心代码与国家的映射
    console.log("开始获取数据中心与国家的映射...");
    const dataMap = await getDatacenterMap();
    console.log("数据中心与国家的映射获取成功。");

    // 提取 IP 和端口
    console.log("开始提取 IP 和端口...");
    const ipEntries = lines
      .slice(1) // 去掉表头
      .map((line) => line.split(",")) // 按逗号分割每一行
      .filter(
        (fields) =>
          fields.length >
          Math.max(ipIndex, portIndex, speedIndex, datacenterIndex),
      ) // 确保有足够的列
      .filter((fields) => {
        if (speed) {
          const speedField = fields[speedIndex];
          if (speedField) {
            const speedfo = parseFloat(fields[speedIndex].replace(" kB/s", ""));
            return speedfo > test;
          }
        }
        return true;
      })
      .map((fields) => {
        const ip = fields[ipIndex];
        const port = fields[portIndex];
        const dc = fields[datacenterIndex];
        const country =
          Object.keys(dataMap).find((country) =>
            dataMap[country].includes(dc),
          ) || "其他";
        console.log(`提取：${ip}:${port}#${country}`);
        return { entry: `${ip}:${port}#${country}`, country };
      });

    console.log("IP 和端口提取完成。");

    const grouped = ipEntries.reduce((acc, { entry, country }) => {
      if (!acc[country]) {
        acc[country] = [];
      }
      if (acc[country].length < shu) {
        acc[country].push(entry);
      }
      return acc;
    }, {});
    console.log("IP 和端口根据国家分组完成。");

    // 可选：对国家进行排序后拼接所有分组
    const result = Object.keys(grouped)
      .sort() // 对国家名称进行排序
      .map((country) => grouped[country].join("\n"))
      .join("\n");

    // 写入到 TXT 文件
    console.log("开始写入 TXT 文件...");
    await fs.promises.writeFile(txtFilegeo, result, "utf8");
    console.log(`已成功提取到 ${txtFilegeo}`);
  } catch (error) {
    console.error("处理文件时发生错误:", error.message);
  }
}

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

    const extractedData = await extractData();

    console.log("开始修改数据中心映射...");
    const newDatacenterMap = await modifyDatacenterMap(
      extractedData,
      datacenterMap,
    );

    console.log("数据中心映射修改完成");
    return newDatacenterMap;
  } catch (error) {
    console.error("获取数据中心映射失败:", error);
  }
}

async function extractData() {
  try {
    // 读取 HTML 文件
    const response = await fetch("https://www.ssl.com/zh-CN/%E5%9B%BD%E5%AE%B6%E4%BB%A3%E7%A0%81/");
    const htmlContent = await response.text();

    console.log("HTML 内容获取成功，开始解析...");

    // 解析 HTML（浏览器环境）
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // 获取表格
    const table = document.querySelector("table");
    if (!table) {
      console.error("未找到表格");
      return;
    }

    // 获取表头
    const headers = Array.from(table.querySelectorAll("tr th")).map(th => th.textContent.trim());

    // 找到目标列索引
    const nameIndex = headers.indexOf("姓名");
    const isoIndex = headers.indexOf("ISO代码 CSR");

    if (nameIndex === -1 || isoIndex === -1) {
      console.error("未找到指定的表头");
      return;
    }

    // 选择所有行（跳过表头）
    const rows = table.querySelectorAll("tr");

    // 存储提取的数据
    const extractedData = {};

    rows.forEach((row, i) => {
      if (i === 0) return; // 跳过表头

      const columns = row.querySelectorAll("td");
      if (columns.length > Math.max(nameIndex, isoIndex)) {
        const name = columns[nameIndex].textContent.trim();
        const isoCode = columns[isoIndex].textContent.trim();

        // 跳过空的 ISO 代码
        if (!isoCode) return;
        extractedData[isoCode] = name;
      }
    });
    console.log("提取的数据:", extractedData);
    return extractedData
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
await extractIpAndPort();
