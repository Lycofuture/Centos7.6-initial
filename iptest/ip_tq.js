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

// 提取列
const ip = "IP地址";
const port = "端口";
const speedtestresult = "下载速度";
const datacenter = "数据中心";

const extractedData = {
  AF: "阿富汗",
  AL: "阿尔巴尼亚",
  DZ: "阿尔及利亚",
  AS: "美属萨摩亚",
  AD: "安道尔",
  AO: "安哥拉",
  AI: "安圭拉",
  AQ: "Antarctica",
  AG: "安提瓜和巴布达",
  AR: "阿根廷",
  AM: "亚美尼亚",
  AW: "阿鲁巴",
  AU: "澳大利亚",
  AT: "奥地利",
  AZ: "阿塞拜疆",
  BS: "巴哈马",
  BH: "巴林",
  BD: "孟加拉国",
  BB: "巴巴多斯",
  BY: "白俄罗斯",
  BE: "比利时",
  BZ: "伯利兹",
  BJ: "贝宁",
  BM: "百慕大",
  BT: "不丹",
  BO: "玻利维亚多民族国",
  BA: "波斯尼亚和黑塞哥维那",
  BW: "博茨瓦纳",
  BV: "布维岛",
  BR: "巴西",
  IO: "英属印度洋领地",
  VG: "维尔京群岛，英属",
  BN: "文莱",
  BG: "保加利亚",
  BF: "布基纳法索",
  MM: "缅甸",
  BI: "布隆迪",
  CV: "佛得角",
  KH: "柬埔寨",
  CM: "喀麦隆",
  CA: "加拿大",
  KY: "开曼群岛",
  CF: "中非共和国",
  TD: "查德",
  CL: "智利",
  CN: "中国",
  CX: "圣诞岛",
  CC: "科科斯",
  CO: "哥伦比亚",
  KM: "科摩罗",
  CD: "刚果民主共和国",
  CG: "刚果",
  CK: "库克群岛",
  CR: "哥斯达黎加",
  CI: "科特迪瓦",
  HR: "克罗地亚",
  CU: "古巴",
  CW: "库拉索",
  CY: "塞浦路斯",
  CZ: "捷克共和国",
  DK: "丹麦",
  DJ: "吉布提",
  DM: "多米尼克",
  DO: "多明尼加共和国",
  EC: "厄瓜多尔",
  EG: "埃及",
  SV: "萨尔瓦多",
  GQ: "赤道几内亚",
  ER: "厄立特里亚",
  EE: "爱沙尼亚",
  ET: "埃塞俄比亚",
  FK: "福克兰群岛（马尔维纳斯群岛）",
  FO: "法罗群岛",
  FJ: "斐",
  FI: "芬兰",
  FR: "法国",
  FX: "法国本土",
  GF: "法属圭亚那",
  PF: "法属波利尼西亚",
  TF: "法国南方的领土",
  GA: "加蓬",
  GM: "冈比亚",
  PS: "巴勒斯坦，国家",
  GE: "格鲁吉亚",
  DE: "德国",
  GH: "加纳",
  GI: "直布罗陀",
  GR: "希腊",
  GL: "格陵兰",
  GD: "格林纳达",
  GP: "瓜德罗普岛",
  GU: "关岛",
  GT: "危地马拉",
  GG: "根西岛",
  GN: "几内亚",
  GW: "几内亚比绍",
  GY: "圭亚那",
  HT: "海地",
  HM: "赫德岛和麦克唐纳群岛",
  VA: "教廷（梵蒂冈城国）",
  HN: "洪都拉斯",
  HK: "香港",
  HU: "匈牙利",
  IS: "冰岛",
  IN: "印度",
  ID: "印度尼西亚",
  IR: "伊朗",
  IQ: "伊拉克",
  IE: "爱尔兰",
  IM: "马恩岛",
  IL: "以色列",
  IT: "意大利",
  JM: "牙买加",
  JP: "日本",
  JE: "新泽西",
  JO: "约旦",
  KZ: "哈萨克斯坦",
  KE: "肯尼亚",
  KI: "基里巴斯",
  KP: "朝鲜",
  KR: "韩国",
  XK: "科索沃",
  KW: "科威特",
  KG: "吉尔吉斯斯坦",
  LA: "老挝人民民主共和国",
  LV: "拉脱维亚",
  LB: "黎巴嫩",
  LS: "莱索托",
  LR: "利比里亚",
  LY: "利比亚",
  LI: "列支敦士登",
  LT: "立陶宛",
  LU: "卢森堡",
  MO: "澳门",
  MK: "北马其顿",
  MG: "马达加斯加",
  MW: "马拉维",
  MY: "马来西亚",
  MV: "马尔代夫",
  ML: "马里",
  MT: "马耳他",
  MH: "马绍尔群岛",
  MQ: "马提尼克",
  MR: "毛里塔尼亚",
  MU: "毛里求斯",
  YT: "马约特",
  MX: "墨西哥",
  FM: "密克罗尼西亚（联邦）",
  MD: "摩尔多瓦共和国",
  MC: "摩纳哥",
  MN: "蒙古",
  ME: "黑山",
  MS: "蒙特塞拉特",
  MA: "摩洛哥",
  MZ: "莫桑比克",
  NA: "纳米比亚",
  NR: "瑙鲁",
  NP: "尼泊尔",
  NL: "荷兰",
  AN: "荷属安的列斯",
  NC: "新喀里多尼亚",
  NZ: "新西兰",
  NI: "尼加拉瓜",
  NE: "尼日尔",
  NG: "尼日利亚",
  NU: "纽埃",
  NF: "诺福克岛",
  MP: "北马里亚纳群岛",
  NO: "挪威",
  OM: "阿曼",
  PK: "巴基斯坦",
  PW: "帕劳",
  PA: "巴拿马",
  PG: "巴布亚新几内亚",
  PY: "巴拉圭",
  PE: "秘鲁",
  PH: "菲律宾",
  PN: "皮特凯恩",
  PL: "波兰",
  PT: "葡萄牙",
  PR: "波多黎各",
  QA: "卡塔尔",
  RE: "团圆",
  RO: "罗马尼亚",
  TW: "台湾",
  RU: "俄罗斯联邦",
  RW: "卢旺达",
  BL: "圣巴泰勒米",
  SH: "圣赫勒拿岛，阿森松岛和特里斯坦 - 达库尼亚群岛",
  KN: "圣基茨和尼维斯",
  LC: "圣卢西亚",
  MF: "圣马丁岛（法属）",
  VC: "圣文森特和格林纳丁斯",
  WS: "萨摩亚",
  SM: "圣马力诺",
  ST: "圣多美和普林西比",
  SA: "沙特阿拉伯",
  SN: "塞内加尔",
  RS: "塞尔维亚",
  SC: "塞舌尔",
  SL: "塞拉利昂",
  SG: "新加坡",
  SX: "圣马丁岛（荷兰的一部分）",
  SK: "斯洛伐克",
  SI: "斯洛文尼亚",
  SB: "所罗门群岛",
  SO: "索马里",
  ZA: "南非",
  GS: "南乔治亚岛和南桑威奇群岛",
  SS: "南苏丹",
  ES: "西班牙",
  LK: "斯里兰卡",
  SD: "苏丹",
  SR: "苏里南",
  PM: "圣皮埃尔和密克隆",
  SZ: "斯威士兰",
  SE: "瑞典",
  CH: "瑞士",
  SY: "叙利亚",
  TJ: "塔吉克斯坦",
  TZ: "坦桑尼亚联合共和国",
  TH: "泰国",
  TL: "东帝汶",
  TG: "多哥",
  TK: "托克劳",
  TO: "汤加",
  TT: "特立尼达和多巴哥",
  TN: "突尼斯",
  TR: "土耳其",
  TM: "土库曼斯坦",
  TC: "特克斯和凯科斯群岛",
  TV: "图瓦卢",
  UG: "乌干达",
  UA: "乌克兰",
  AE: "阿拉伯联合酋长国",
  GB: "英国",
  US: "美国",
  UM: "美国本土外小岛屿",
  UY: "乌拉圭",
  UZ: "乌兹别克斯坦",
  VU: "瓦努阿图",
  VE: "委内瑞拉",
  VN: "越南",
  VI: "维尔京群岛，美国",
  WF: "瓦利斯和富图纳群岛",
  EH: "西撒哈拉",
  UN: "联合国",
  EU: "欧盟",
  YE: "也门",
  ZM: "赞比亚",
  ZW: "津巴布韦",
  WI: "西印度群岛联邦",
  EN: "独立国家联合体",
  YG: "南斯拉夫",
  UR: "苏联",
  DH: "达荷美",
  VL: "上沃尔特",
  AX: "奥兰群岛",
  BQ: "博内尔岛，圣尤斯特歇斯和萨巴",
  SJ: "斯瓦尔巴特",
};
async function processCSVFiles() {
  try {
    // 获取所有 CSV 文件
    const files = fs
      .readdirSync(__dirname)
      .filter((file) => file.endsWith(".csv"));
    if (files.length === 0) {
      console.log("未找到 CSV 文件。");
      return;
    }

    console.log(`发现 ${files.length} 个 CSV 文件，开始处理...`);

    for (const file of files) {
      const csvFilePath = path.resolve(__dirname, file);
      const txtFilePath = path.resolve(__dirname, file.replace(".csv", ".txt"));

      console.log(`处理文件: ${file}`);
      await extractIpAndPort(csvFilePath, txtFilePath);
    }
  } catch (error) {
    console.error("处理文件时发生错误:", error.message);
  }
}
async function extractIpAndPort(csvFilePath, txtFilePath) {
  try {
    // 读取 CSV 文件内容
    console.log(`开始读取 CSV 文件...${csvFilePath}`);
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

    console.log(`IP 和端口提取完成。${ipEntries.length}`);

    const grouped = ipEntries.reduce((acc, { entry, country }) => {
      if (!acc[country]) {
        acc[country] = [];
      }
      if (shu === 0 || acc[country].length < shu) {
        acc[country].push(entry);
      }
      return acc;
    }, {});
    console.log("IP 和端口根据国家分组完成。");

    // 可选：对国家进行排序后拼接所有分组
    const result = Object.keys(grouped)
      .sort() // 对国家名称进行排序
      .map((country, index) => {
        return grouped[country]
        .map((entry, index) => `${entry}${index + 1}`) // 添加序号
        .join("\n");
      })
      .join("\n");

    // 写入到 TXT 文件
    console.log("开始写入 TXT 文件...");
    await fs.promises.writeFile(txtFilePath, result, "utf8");
    console.log(`已成功提取到 ${txtFilePath}`);
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
await processCSVFiles();
