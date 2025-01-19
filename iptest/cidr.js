import fs from 'fs';
import ip from 'ip';
// 文件路径
const cidrFile = 'cidrs.txt';
const outputIPv4File = 'extraction_ip.txt';

// 读取文件内容
const readCIDRFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    console.log(`成功读取文件: ${filePath}`);
    return data.split('\n').map(line => line.trim()).filter(line => line);
  } catch (error) {
    console.error(`读取文件失败: ${filePath}`, error);
    return [];
  }
};

// IPv4 拆解
const cidrToIPv4s = (cidr) => {
  const subnet = ip.cidrSubnet(cidr);
  const ips = [];
  let start = ip.toLong(subnet.firstAddress);
  const end = ip.toLong(subnet.lastAddress);
  for (let i = start; i <= end; i++) {
    ips.push(`${ip.fromLong(i)} 443`);
  }
  return ips;
};


// 清空输出文件
fs.writeFileSync(outputIPv4File, '');
console.log(`初始化文件: ${outputIPv4File}`);

// 读取 CIDR 列表
const cidrList = readCIDRFile(cidrFile);

// 处理 CIDR 地址
const processCIDR = async (cidr) => {
  try {
    let ips = [];
    ips = cidrToIPv4s(cidr);
    ips.forEach(ip => fs.appendFileSync(outputIPv4File, `${ip}\n`));
    console.log(`处理 CIDR: ${cidr}, 数量: ${ips.length}`);
  } catch (error) {
    console.error(`处理失败: ${cidr}, 错误: ${error.message}`);
  }
};

// 并行处理 CIDR
const processAllCIDRs = async () => {
  try {
    const tasks = cidrList.map(cidr => processCIDR(cidr));
    await Promise.all(tasks);
    console.log(`所有 CIDR 处理完成，结果已写入到 ${outputIPv4File}`);
  } catch (error) {
    console.error('处理过程中发生错误:', error);
  }
};

// 执行处理
processAllCIDRs();
