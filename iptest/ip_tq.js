import fs from "fs";
import path from "path";
import url from "url";
import fetch from "node-fetch";
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
    const data = await fs.promises.readFile(csvFilePath, "utf8");

    // 按行分割 CSV 内容
    const lines = data
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line); // 去掉空行
    if (lines.length < 2) {
      throw new Error("CSV 文件内容不足或格式不正确");
    }

    // 获取表头
    const headers = lines[0].split(",");
    const ipIndex = headers.indexOf(ip);
    const portIndex = headers.indexOf(port);
    const speedIndex = headers.indexOf(speedtestresult);
    const datacenterIndex = headers.indexOf(datacenter);

    if (ipIndex === -1 || portIndex === -1 || datacenterIndex === -1) {
      throw new Error(`CSV 文件缺少 ${ip}、${port} 或 ${datacenter} 列`);
    }
    // 数据中心代码与国家的映射
    const datacenterMap = {
      AL: ["TIA"],
      DZ: ["ALG", "AAE", "ORN"],
      AO: ["LAD"],
      AR: ["EZE", "COR", "NQN"],
      AM: ["EVN"],
      AU: ["ADL", "BNE", "CBR", "HBA", "MEL", "PER", "SYD"],
      AT: ["VIE"],
      AZ: ["LLK", "GYD"],
      BH: ["BAH"],
      BD: ["CGP", "DAC", "JSR"],
      BB: ["BGI"],
      BY: ["MSQ"],
      BE: ["BRU"],
      BT: ["PBH"],
      BO: ["LPB"],
      BW: ["GBE"],
      BR: [
        "QWJ",
        "ARU",
        "BEL",
        "CNF",
        "BNU",
        "BSB",
        "CFC",
        "VCP",
        "CAW",
        "XAP",
        "CGB",
        "CWB",
        "FLN",
        "FOR",
        "GYN",
        "ITJ",
        "JOI",
        "JDO",
        "MAO",
        "PMW",
        "POA",
        "REC",
        "RAO",
        "GIG",
        "SSA",
        "SJP",
        "SJK",
        "GRU",
        "SOD",
        "NVT",
        "UDI",
        "VIX",
      ],
      BN: ["BWN"],
      BG: ["SOF"],
      BF: ["OUA"],
      KH: ["PNH"],
      CA: ["YYC", "YVR", "YWG", "YHZ", "YOW", "YYZ", "YUL", "YXE"],
      CL: ["ARI", "SCL"],
      CO: ["BAQ", "BOG", "CLO", "MDE"],
      CD: ["FIH"],
      CR: ["SJO"],
      CI: ["ABJ", "ASK"],
      HR: ["ZAG"],
      CY: ["LCA"],
      CZ: ["PRG"],
      DK: ["CPH"],
      DJ: ["JIB"],
      DO: ["STI", "SDQ"],
      EC: ["GYE", "UIO"],
      EG: ["CAI"],
      EE: ["TLL"],
      FJ: ["SUV"],
      FI: ["HEL"],
      法国: ["BOD", "LYS", "MRS", "CDG"],
      PF: ["PPT"],
      GE: ["TBS"],
      德国: ["TXL", "DUS", "FRA", "HAM", "MUC", "STR"],
      GH: ["ACC"],
      GR: ["ATH", "SKG"],
      GD: ["GND"],
      GU: ["GUM"],
      GT: ["GUA"],
      GY: ["GEO"],
      HN: ["TGU"],
      香港: ["HKG"],
      HU: ["BUD"],
      IS: ["KEF"],
      IN: [
        "AMD",
        "BLR",
        "BBI",
        "IXC",
        "MAA",
        "HYD",
        "CNN",
        "KNU",
        "COK",
        "CCU",
        "BOM",
        "NAG",
        "DEL",
        "PAT",
      ],
      ID: ["DPS", "CGK", "JOG"],
      IQ: ["BGW", "BSR", "EBL", "NJF", "XNH", "ISU"],
      IE: ["ORK", "DUB"],
      IL: ["HFA", "TLV"],
      IT: ["MXP", "PMO", "FCO"],
      JM: ["KIN"],
      日本: ["FUK", "OKA", "KIX", "NRT"],
      JO: ["AMM"],
      KZ: ["AKX", "ALA", "NQZ"],
      KE: ["MBA", "NBO"],
      韩国: ["ICN"],
      KW: ["KWI"],
      LA: ["VTE"],
      LV: ["RIX"],
      LB: ["BEY"],
      LT: ["VNO"],
      LU: ["LUX"],
      MO: ["MFM"],
      MG: ["TNR"],
      MY: ["JHB", "KUL", "KCH"],
      MV: ["MLE"],
      MU: ["MRU"],
      MX: ["GDL", "MEX", "QRO"],
      MD: ["KIV"],
      MN: ["ULN"],
      MZ: ["MPM"],
      NA: ["WDH"],
      NP: ["KTM"],
      NL: ["AMS"],
      NC: ["NOU"],
      NZ: ["AKL", "CHC"],
      NG: ["LOS"],
      MK: ["SKP"],
      NO: ["OSL"],
      OM: ["MCT"],
      PK: ["ISB", "KHI", "LHE"],
      PS: ["ZDM"],
      PA: ["PTY"],
      PY: ["ASU"],
      PE: ["LIM"],
      PH: ["CGY", "CEB", "MNL", "CRK"],
      PL: ["WAW"],
      PT: ["LIS"],
      PR: ["SJU"],
      QA: ["DOH"],
      RE: ["RUN"],
      RO: ["OTP"],
      RU: ["KJA", "DME", "LED", "SVX"],
      RW: ["KGL"],
      SA: ["DMM", "JED", "RUH"],
      SN: ["DKR"],
      RS: ["BEG"],
      新加坡: ["SIN"],
      SK: ["BTS"],
      ZA: ["CPT", "DUR", "JNB"],
      ES: ["BCN", "MAD"],
      LK: ["CMB"],
      SR: ["PBM"],
      瑞典: ["GOT", "ARN"],
      CH: ["GVA", "ZRH"],
      TW: ["KHH", "TPE"],
      TZ: ["DAR"],
      TH: ["BKK", "CNX", "URT"],
      TT: ["POS"],
      TN: ["TUN"],
      TR: ["IST", "ADB"],
      UG: ["EBB"],
      UA: ["KBP"],
      AE: ["DXB"],
      英国: ["EDI", "LHR", "MAN"],
      美国: [
        "ANC",
        "PHX",
        "LAX",
        "SMF",
        "SAN",
        "SFO",
        "SJC",
        "DEN",
        "JAX",
        "MIA",
        "TLH",
        "TPA",
        "ATL",
        "HNL",
        "ORD",
        "IND",
        "BGR",
        "BOS",
        "DTW",
        "MSP",
        "MCI",
        "STL",
        "OMA",
        "LAS",
        "EWR",
        "ABQ",
        "BUF",
        "CLT",
        "RDU",
        "CLE",
        "CMH",
        "OKC",
        "PDX",
        "PHL",
        "PIT",
        "FSD",
        "MEM",
        "BNA",
        "AUS",
        "DFW",
        "IAH",
        "MFE",
        "SAT",
        "SLC",
        "IAD",
        "ORF",
        "RIC",
        "SEA",
      ],
      VN: ["DAD", "HAN", "SGN"],
      ZW: ["HRE"],
    };
    // 提取 IP 和端口
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
          Object.keys(datacenterMap).find((country) =>
            datacenterMap[country].includes(dc),
          ) || "其他";
        console.log(`提取：${ip}:${port}#${country}`);
        return { entry: `${ip}:${port}#${country}`, country };
      });

    const grouped = ipEntries.reduce((acc, { entry, country }) => {
      if (!acc[country]) {
        acc[country] = [];
      }
      if (acc[country].length < shu) {
        acc[country].push(entry);
      }
      return acc;
    }, {});

    // 可选：对国家进行排序后拼接所有分组
    const result = Object.keys(grouped)
      .sort() // 对国家名称进行排序
      .map((country) => grouped[country].join("\n"))
      .join("\n");

    // 写入到 TXT 文件
    await fs.promises.writeFile(txtFilegeo, result, "utf8");
    console.log(`已成功提取到 ${txtFilegeo}`);
  } catch (error) {
    console.error("处理文件时发生错误:", error.message);
  }
}

extractIpAndPort();
