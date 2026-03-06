import Ocr from '@gutenye/ocr-browser'

import type { PackageCheckInFormData } from "../page/package/packageList/package-service";

/**
 * @description 单个坐标点的类型 [x, y]
 */
type Point = [number, number];

// 定义边界框类型（四个坐标点）
type BoundingBox = [Point, Point, Point, Point];

/**
 * @param {BoundingBox} bounding_box OCR的边界框
 * @param {number} confidence 置信度
 * @param {string} text 识别文本
 */
export interface RecognitionItem {
  bounding_box: BoundingBox;
  confidence: number;
  text: string;
}

/**
 * @description OCR 识别结果，包含原始识别数据和提取的快递信息
 */
export interface OcrResults {
  rawResults: RecognitionData;
  extractedInfo: PackageCheckInFormData | null;
}

/**
 * @description OCR识别数据,包含文本边界,置信度,识别文本的数组
 */
export type RecognitionData = RecognitionItem[];

/**
 * @description OCR识别结果，包含原始识别数据和提取的快递信息
 */
export interface OcrResults {
  rawResults: RecognitionData;
  extractedInfo: PackageCheckInFormData | null;
}


/**
 * @description OCR识别图片中的文本
 * @param {string} image 图片base64编码
 * @returns {Promise<RecognitionData>} OCR识别数据
 */
export async function ocr(image: string): Promise<RecognitionData> {
  const api = '/ocr'
  const response = await fetch(api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      image: image
    })
  })

  const data = await response.json() as RecognitionData
  console.log(data)

  // 确保返回的是字符串数组
  if (Array.isArray(data)) {
    return data
  } else {
    throw new Error('返回的数据格式不正确')
  }
}

/**
 * @description 从OCR识别数据中提取快递信息
 * @param {RecognitionData} ocrResults OCR识别数据
 * @returns {PackageCheckInFormData | null} 提取的快递信息或null
 */
export function extractPackageInfo(ocrResults: RecognitionData): PackageCheckInFormData | null {
  let formData: PackageCheckInFormData = {
    tracking_number: '',
    carrier: '',
    guest_name: '',
    room_number: '',
    guest_phone: '',
    received_by: '',
    notes: '',
    storage_location: '',
    storage_number: ''
  }

  let allText = ocrResults.map(item => item.text).join(' ');

  // 1. 提取快递公司
  const carrierPatterns = [
    { pattern: /顺丰|SF|sf/i, carrier: '顺丰' },
    { pattern: /京东|JD|jd/i, carrier: '京东' },
    { pattern: /圆通|YT|yt/i, carrier: '圆通' },
    { pattern: /中通|ZT|zt/i, carrier: '中通' },
    { pattern: /申通|ST|st/i, carrier: '申通' },
    { pattern: /韵达|YD|yd/i, carrier: '韵达' },
    { pattern: /天天|TT|tt/i, carrier: '天天' },
    { pattern: /邮政|YZ|yz/i, carrier: '邮政' },
    { pattern: /百世|BS|bs/i, carrier: '百世' },
    { pattern: /德邦|DB|db/i, carrier: '德邦' },
    { pattern: /极兔|JT|jt/i, carrier: '极兔' },
    { pattern: /优速|YS|ys/i, carrier: '优速' }
  ];
  // 识别快递公司：遍历预定义的快递公司模式
  // 使用正则表达式匹配OCR文本中的快递公司标识
  // 一旦匹配成功，就设置formData.carrier并跳出循环
  for (const carrierInfo of carrierPatterns) {
    if (carrierInfo.pattern.test(allText)) {
      formData.carrier = carrierInfo.carrier;
      // 从文本中剔除这部分内容，避免后续提取时干扰
      allText = allText.replace(carrierInfo.pattern, '');
      break;
    }
  }

  // 2. 提取快递单号 (通常为10-15位数字或字母数字组合)
  // 常见快递单号模式

  let trackingPatterns: RegExp[] = [];
  switch (formData.carrier) {
    case '顺丰':
      trackingPatterns = [
        /\bSF\d{12,13}\b/gi,  // 顺丰单号
      ];
      break;
    case '京东':
      trackingPatterns = [
        /\bJD\d{12,15}\b/gi,  // 京东单号
      ];
      break;
    case '极兔':
      trackingPatterns = [
        /\bJT\d{12,13}\b/gi,  // 极兔单号
      ];
      break;
    default:
      trackingPatterns = [
        /\b\d{10,15}\b/g,  // 10-15位纯数字
        /\b[A-Za-z0-9]{10,15}\b/g,  // 10-15位字母数字组合
      ];
      break;
  }

  let trackingNumberFound = '';
  for (const pattern of trackingPatterns) {
    const matches = allText.match(pattern);
    if (matches && matches.length > 0) {
      trackingNumberFound = matches[0];
      break;
    }
  }

  if (trackingNumberFound) {
    // 记录数据
    formData.tracking_number = trackingNumberFound;
    // 从文本中剔除这部分内容，避免后续提取时干扰
    allText = allText.replace(new RegExp(trackingNumberFound, 'g'), '');
  }

  // 提取虚拟号码并剔除这部分内容，避免后续提取时干扰
  const virtualNumberPattern = /\d{11}\s*转\s*\d{3,4}/g;
  const virtualNumberMatch = allText.match(virtualNumberPattern);
  if (virtualNumberMatch && virtualNumberMatch.length > 0) {
    allText = allText.replace(virtualNumberPattern, '');
    allText = allText.replace(/虚拟号码/g, '');
  }

  // 将 allText 转换为数组，去除无效内容后转换回去
  const allTextArray = allText.split(' ');

  // 过滤：1) 去除空字符串 2) 去除只包含符号（无字母、数字、中文等有效字符）的内容
  const filteredTextArray = allTextArray.filter(item => {
    const trimmed = item.trim();
    // 保留至少包含一个有效字符的内容：
    // - 英文字母 a-zA-Z
    // - 数字 0-9
    // - 中文字符 \u4e00-\u9fa5（可根据需要扩展其他语言）
    // - 其他语言字母可用 \p{L}（需开启 unicode flag）
    return trimmed !== '' && /[a-zA-Z0-9\u4e00-\u9fa5]/.test(trimmed);
  });

  // 转换回字符串（注意变量名应为 filteredTextArray）
  allText = filteredTextArray.join(' ');

  // 寻找收件人信息
  const privacyPhonePattern = /\d{3,4}[\*Xx]{4,}\d{4}|[\*Xx]{6,}\d{4}|\d{1,2}[\*Xx]{1,2}\d{4}/g;
  const privacyPhoneMatch = allText.match(privacyPhonePattern);
  if (privacyPhoneMatch && privacyPhoneMatch.length > 0) {
    // match 方法会返回所有匹配项，取第一个作为结果
    formData.guest_phone = privacyPhoneMatch[0];
  }
  // 取出收件人姓名
  const namePhone = filteredTextArray.indexOf(formData.guest_phone || '');
  if (namePhone >= 0) {
    // 首先处理名字和手机号被识别在一起的情况
    // 遍历文本数组，查找包含手机号且前后有姓名特征的合并字符串
    for (let i = 0; i < filteredTextArray.length; i++) {
      const str = filteredTextArray[i];
      // 精确匹配中国大陆手机号（11位，13-19开头）
      const phoneMatch = str.match(/(1[3-9]\d{9})/);

      if (phoneMatch) {
        const phone = phoneMatch[1];
        // 检查该字符串是否包含非手机号内容（可能是姓名）
        const cleanedStr = str.replace(phone, '').trim();

        if (cleanedStr && /[a-zA-Z\u4e00-\u9fa5]/.test(cleanedStr)) {
          // 尝试拆分：优先取手机号前的部分作为姓名
          const parts = str.split(phone);
          let candidateName = parts[0].trim();

          // 如果前部分不符合姓名特征，尝试后部分
          if (!candidateName || !/[a-zA-Z\u4e00-\u9fa5]/.test(candidateName)) {
            candidateName = (parts[1] || '').trim();
          }

          // 验证候选姓名有效性（非空、非纯数字/符号）
          if (candidateName && /[a-zA-Z\u4e00-\u9fa5]/.test(candidateName)) {
            // 仅当尚未设置姓名或当前姓名更合理时才更新
            if (!formData.guest_name ||
              (formData.guest_name && formData.guest_name.length < candidateName.length)) {
              formData.guest_name = candidateName;
            }

            // 始终更新手机号（合并字符串中的更可靠）
            formData.guest_phone = phone;

            // 重要：清除原合并字符串在数组中的干扰
            // 避免后续逻辑重复处理或错误匹配
            filteredTextArray[i] = '';
            break; // 找到有效合并项后终止循环
          }
        }
      }
    }
  }

  console.log('完成提取，剩余文本:', allText);

  console.log('提取的快递信息:', formData);

  // 如果至少提取到了快递单号或快递公司，则返回数据
  if (formData.tracking_number || formData.carrier) {
    return formData;
  }

  // 如果未找到匹配项，返回null
  return null;
}