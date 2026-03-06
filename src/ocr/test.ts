/**
 * OCR服务测试文件
 * 用于测试收件人信息提取功能
 */

import { extractPackageInfo } from './ocrService';
import type { RecognitionItem } from './ocrService';

// 模拟OCR结果数据（基于用户提供的示例）
const mockOcrResults: RecognitionItem[] = [
  // 收件人信息（上半部分）
  {
    bounding_box: [[802, 1652], [1377, 1638], [1380, 1723], [804, 1737]],
    confidence: 0.9238421320915222,
    text: "欧********6080"
  },
  {
    bounding_box: [[806, 1725], [2053, 1689], [2056, 1778], [809, 1814]],
    confidence: 0.9985009431838989,
    text: "广东省深圳市南山区粤海街道后海滨路海"
  },
  {
    bounding_box: [[802, 1789], [2057, 1748], [2061, 1851], [805, 1891]],
    confidence: 0.9741910099983215,
    text: "德三道，深圳凯宾斯基酒店三楼宴会仓库"
  },
  {
    bounding_box: [[829, 1865], [1073, 1865], [1073, 1954], [829, 1954]],
    confidence: 0.9193117022514343,
    text: "（手套）"
  },
  
  // 寄件人信息（下半部分）
  {
    bounding_box: [[715, 2002], [1582, 1979], [1585, 2086], [718, 2109]],
    confidence: 0.9956670999526978,
    text: "梁海力13776068456"
  },
  {
    bounding_box: [[758, 2100], [1577, 2072], [1581, 2175], [762, 2203]],
    confidence: 0.9979426264762878,
    text: "江苏省苏州市姑苏区"
  },
  {
    bounding_box: [[736, 2198], [1184, 2183], [1188, 2290], [740, 2305]],
    confidence: 0.9939631223678589,
    text: "白洋湾街道"
  },
  {
    bounding_box: [[732, 2296], [1495, 2273], [1498, 2376], [735, 2399]],
    confidence: 0.9980408549308777,
    text: "中海御景湾14-1909"
  },
  
  // 其他信息
  {
    bounding_box: [[2385, 580], [2477, 574], [2511, 1148], [2419, 1154]],
    confidence: 0.9891449213027954,
    text: "JT3129101663282"
  },
  {
    bounding_box: [[606, 1486], [1979, 1450], [1982, 1569], [609, 1605]],
    confidence: 0.976115345954895,
    text: "虚拟号码15794918667转2997"
  }
];

// 测试函数
function testExtractPackageInfo() {
  console.log('开始测试收件人信息提取功能...\n');
  
  // 测试1：提取收件人信息
  console.log('测试1：提取隐私化收件人信息');
  const result = extractPackageInfo(mockOcrResults);
  
  if (result) {
    console.log('提取结果:');
    console.log('- 收件人姓名:', result.guest_name);
    console.log('- 收件人手机号:', result.guest_phone);
    console.log('- 快递单号:', result.tracking_number);
    console.log('- 快递公司:', result.carrier);
    console.log('- 房间号:', result.room_number);
    
    // 验证结果
    const expectedName = '欧'; // 期望提取姓氏"欧"
    const expectedPhone = '6080'; // 期望提取手机尾号"6080"
    
    if (result.guest_name === expectedName) {
      console.log('✓ 收件人姓名提取正确');
    } else {
      console.log(`✗ 收件人姓名提取错误: 期望 "${expectedName}", 实际 "${result.guest_name}"`);
    }
    
    if (result.guest_phone === expectedPhone) {
      console.log('✓ 收件人手机号提取正确');
    } else {
      console.log(`✗ 收件人手机号提取错误: 期望 "${expectedPhone}", 实际 "${result.guest_phone}"`);
    }
  } else {
    console.log('✗ 未提取到任何信息');
  }
  
  console.log('\n---\n');
  
  // 测试2：测试完整姓名和手机号
  console.log('测试2：测试完整姓名和手机号提取');
  const mockOcrResults2: RecognitionItem[] = [
    // 收件人信息（完整）
    {
      bounding_box: [[500, 500], [600, 500], [600, 550], [500, 550]],
      confidence: 0.95,
      text: "张三丰13800138000"
    },
    // 寄件人信息
    {
      bounding_box: [[500, 600], [600, 600], [600, 650], [500, 650]],
      confidence: 0.95,
      text: "李四13900139000"
    }
  ];
  
  const result2 = extractPackageInfo(mockOcrResults2);
  if (result2) {
    console.log('提取结果:');
    console.log('- 收件人姓名:', result2.guest_name);
    console.log('- 收件人手机号:', result2.guest_phone);
    
    // 应该提取到"张三丰"而不是"李四"
    if (result2.guest_name === '张三丰') {
      console.log('✓ 正确区分收件人和寄件人姓名');
    } else {
      console.log(`✗ 姓名提取错误: 期望 "张三丰", 实际 "${result2.guest_name}"`);
    }
  }
  
  console.log('\n---\n');
  
  // 测试3：测试虚拟号码
  console.log('测试3：测试虚拟号码提取');
  const mockOcrResults3: RecognitionItem[] = [
    {
      bounding_box: [[500, 500], [700, 500], [700, 550], [500, 550]],
      confidence: 0.95,
      text: "王五虚拟号码15794918667转2997"
    }
  ];
  
  const result3 = extractPackageInfo(mockOcrResults3);
  if (result3) {
    console.log('提取结果:');
    console.log('- 收件人姓名:', result3.guest_name);
    console.log('- 收件人手机号:', result3.guest_phone);
    
    if (result3.guest_phone === '2997') {
      console.log('✓ 虚拟号码转接尾号提取正确');
    }
  }
}

// 测试4：基于用户提供的OCR文本（林*彬和13******974）
console.log('测试4：测试用户提供的OCR文本（林*彬和13******974）');
const mockOcrResults4: RecognitionItem[] = [
  // 基于用户提供的文本创建模拟数据
  {
    bounding_box: [[100, 100], [200, 100], [200, 120], [100, 120]],
    confidence: 0.977,
    text: "收件人：林*彬"
  },
  {
    bounding_box: [[100, 130], [200, 130], [200, 150], [100, 150]],
    confidence: 0.989,
    text: "电话：13******974"
  },
  {
    bounding_box: [[100, 160], [300, 160], [300, 180], [100, 180]],
    confidence: 0.996,
    text: "地址：广东省深圳市南山区海德三道凯宾斯基酒店"
  },
  {
    bounding_box: [[100, 190], [250, 190], [250, 210], [100, 210]],
    confidence: 0.997,
    text: "1319315692414"
  },
  {
    bounding_box: [[100, 220], [200, 220], [200, 240], [100, 240]],
    confidence: 0.996,
    text: "中国邮政"
  },
  {
    bounding_box: [[100, 250], [200, 250], [200, 270], [100, 270]],
    confidence: 0.985,
    text: "标准快递"
  }
];

const result4 = extractPackageInfo(mockOcrResults4);
if (result4) {
  console.log('提取结果:');
  console.log('- 收件人姓名:', result4.guest_name);
  console.log('- 收件人手机号:', result4.guest_phone);
  console.log('- 快递单号:', result4.tracking_number);
  console.log('- 快递公司:', result4.carrier);
  
  // 验证结果
  const expectedName = '林彬'; // 期望提取完整姓名"林彬"
  const expectedPhone = '974'; // 期望提取手机尾号"974"
  const expectedTracking = '1319315692414'; // 期望提取快递单号
  const expectedCarrier = '邮政'; // 期望提取快递公司
  
  if (result4.guest_name === expectedName) {
    console.log('✓ 收件人姓名提取正确');
  } else {
    console.log(`✗ 收件人姓名提取错误: 期望 "${expectedName}", 实际 "${result4.guest_name}"`);
  }
  
  if (result4.guest_phone === expectedPhone) {
    console.log('✓ 收件人手机号提取正确');
  } else {
    console.log(`✗ 收件人手机号提取错误: 期望 "${expectedPhone}", 实际 "${result4.guest_phone}"`);
  }
  
  if (result4.tracking_number === expectedTracking) {
    console.log('✓ 快递单号提取正确');
  } else {
    console.log(`✗ 快递单号提取错误: 期望 "${expectedTracking}", 实际 "${result4.tracking_number}"`);
  }
  
  if (result4.carrier === expectedCarrier) {
    console.log('✓ 快递公司提取正确');
  } else {
    console.log(`✗ 快递公司提取错误: 期望 "${expectedCarrier}", 实际 "${result4.carrier}"`);
  }
} else {
  console.log('✗ 未提取到任何信息');
}

console.log('\n---\n');

// 测试5：测试其他隐私化格式
console.log('测试5：测试其他隐私化格式');
const mockOcrResults5: RecognitionItem[] = [
  {
    bounding_box: [[100, 100], [200, 100], [200, 120], [100, 120]],
    confidence: 0.95,
    text: "张**"
  },
  {
    bounding_box: [[100, 130], [200, 130], [200, 150], [100, 150]],
    confidence: 0.95,
    text: "138****5678"
  }
];

const result5 = extractPackageInfo(mockOcrResults5);
if (result5) {
  console.log('提取结果:');
  console.log('- 收件人姓名:', result5.guest_name);
  console.log('- 收件人手机号:', result5.guest_phone);
  
  if (result5.guest_name === '张') {
    console.log('✓ 隐私化姓名提取正确');
  }
  
  if (result5.guest_phone === '5678') {
    console.log('✓ 隐私化手机号提取正确');
  }
}

console.log('\n---\n');

// 测试6：基于用户提供的新OCR文本（钟佳炼17722186859和*******3620）
console.log('测试6：测试用户提供的新OCR文本（钟佳炼17722186859和*******3620）');
const mockOcrResults6: RecognitionItem[] = [
  // 基于用户提供的新文本创建模拟数据
  {
    bounding_box: [[100, 100], [200, 100], [200, 120], [100, 120]],
    confidence: 0.828,
    text: "韵达："
  },
  {
    bounding_box: [[100, 130], [200, 130], [200, 150], [100, 150]],
    confidence: 0.999,
    text: "434972601125680"
  },
  {
    bounding_box: [[100, 160], [300, 160], [300, 180], [100, 180]],
    confidence: 0.992,
    text: "深圳凯宾斯基酒店"
  },
  {
    bounding_box: [[100, 190], [300, 190], [300, 210], [100, 210]],
    confidence: 0.974,
    text: "虚拟号码15794976853转6315"
  },
  {
    bounding_box: [[100, 220], [200, 220], [200, 240], [100, 240]],
    confidence: 0.961,
    text: "*******3620"
  },
  {
    bounding_box: [[100, 250], [300, 250], [300, 270], [100, 270]],
    confidence: 0.988,
    text: "广东省深圳市南山区粤海街道粤"
  },
  {
    bounding_box: [[100, 280], [300, 280], [300, 300], [100, 300]],
    confidence: 0.920,
    text: "钟佳炼17722186859"
  },
  {
    bounding_box: [[100, 310], [300, 310], [300, 330], [100, 330]],
    confidence: 0.994,
    text: "揭阳市榕城区钟洋工业区恒嘉达"
  }
];

const result6 = extractPackageInfo(mockOcrResults6);
if (result6) {
  console.log('提取结果:');
  console.log('- 收件人姓名:', result6.guest_name);
  console.log('- 收件人手机号:', result6.guest_phone);
  console.log('- 快递单号:', result6.tracking_number);
  console.log('- 快递公司:', result6.carrier);
  
  // 验证结果
  const expectedName = '钟佳炼'; // 期望提取姓名"钟佳炼"
  const expectedPhone = '17722186859'; // 期望提取完整手机号
  const expectedTracking = '434972601125680'; // 期望提取快递单号
  const expectedCarrier = '韵达'; // 期望提取快递公司
  
  if (result6.guest_name === expectedName) {
    console.log('✓ 收件人姓名提取正确');
  } else {
    console.log(`✗ 收件人姓名提取错误: 期望 "${expectedName}", 实际 "${result6.guest_name}"`);
  }
  
  if (result6.guest_phone === expectedPhone) {
    console.log('✓ 收件人手机号提取正确');
  } else {
    console.log(`✗ 收件人手机号提取错误: 期望 "${expectedPhone}", 实际 "${result6.guest_phone}"`);
  }
  
  if (result6.tracking_number === expectedTracking) {
    console.log('✓ 快递单号提取正确');
  } else {
    console.log(`✗ 快递单号提取错误: 期望 "${expectedTracking}", 实际 "${result6.tracking_number}"`);
  }
  
  if (result6.carrier === expectedCarrier) {
    console.log('✓ 快递公司提取正确');
  } else {
    console.log(`✗ 快递公司提取错误: 期望 "${expectedCarrier}", 实际 "${result6.carrier}"`);
  }
  
  // 额外检查：虚拟号码转接尾号
  console.log('\n检查虚拟号码提取:');
  // 虚拟号码15794976853转6315 应该提取尾号6315
  if (result6.guest_phone === '6315' || result6.guest_phone === '17722186859') {
    console.log('✓ 手机号提取合理（可能是完整手机号或虚拟号码尾号）');
  }
} else {
  console.log('✗ 未提取到任何信息');
}

console.log('\n---\n');

// 运行所有测试
testExtractPackageInfo();