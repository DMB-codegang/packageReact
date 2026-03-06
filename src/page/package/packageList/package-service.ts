// 快递入库表单数据类型

/**
 * @description 快递入库表单数据类型
 * @param {string} tracking_number 快递单号
 * @param {string} carrier 快递公司
 * @param {string} guest_name 收件人姓名
 * @param {string} room_number 房间号
 * @param {string} guest_phone? 收件人手机号
 * @param {string} received_by 接收人
 * @param {string} notes? 备注
 * @param {string} storage_location? 存储位置
 * @param {string} storage_number? 存储号
 */
export type PackageCheckInFormData = {
  tracking_number: string;
  carrier: string;
  guest_name: string;
  room_number: string;
  guest_phone?: string;
  received_by: string;
  notes?: string;
  storage_location?: string;
  storage_number?: string;
}

/**
 * @description 快递出库表单数据类型
 * @param {string} tracking_number 快递单号
 * @param {string} picked_up_by 接收人
 * @param {string} notes? 备注
 */
export type PackageCheckOutFormData = {
  tracking_number: string;
  picked_up_by: string;
  notes?: string;
}

/**
 * @description 快递列表数据类型
 * @param {number} id 快递ID
 * @param {string} tracking_number 快递单号
 * @param {string} carrier 快递公司
 * @param {string} guest_name 收件人姓名
 * @param {string} room_number 房间号
 * @param {string | null} guest_phone 收件人手机号
 * @param {string} status 状态
 * @param {string} receive_time 接收时间
 * @param {string | null} pickup_time 取件时间
 * @param {string} received_by 接收人
 * @param {string | null} picked_up_by 取件人
 * @param {string | null} storage_location 存储位置
 * @param {string | null} storage_number 存储号
 * @param {string | null} notes 备注
 * @param {string} created_at 创建时间
 * @param {string} updated_at 更新时间
 */
export type Package = {
  id: number;
  tracking_number: string;
  carrier: string;
  guest_name: string;
  room_number: string;
  guest_phone: string | null;
  status: string;
  receive_time: string;
  pickup_time: string | null;
  received_by: string;
  picked_up_by: string | null;
  storage_location: string | null;
  storage_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * @description 获取快递列表
 * @returns {Promise<Package[]>} 快递列表数据
 */
export async function getPackageList(): Promise<Package[]> {
  try {
    const response = await fetch('/api/packages/getlist');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('API返回数据:', data);
    
    // 检查数据结构，确保是数组
    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.data)) {
      return data.data;
    } else {
      console.error('API返回数据格式不正确:', data);
      return [];
    }
  } catch (error) {
    console.error('获取快递列表失败:', error);
    throw error;
  }
}

/**
 * @description 快递入库
 * @param {PackageCheckInFormData} data 快递入库表单数据
 * @returns {Promise<void>} 无返回值
 */
export async function checkinPackage(data: PackageCheckInFormData): Promise<void> {
  try {
    // 准备JSON数据
    const jsonData = {
      tracking_number: data.tracking_number,
      carrier: data.carrier,
      guest_name: data.guest_name,
      room_number: data.room_number,
      received_by: data.received_by,
      // 可选字段
      ...(data.guest_phone && { guest_phone: data.guest_phone }),
      ...(data.notes && { notes: data.notes }),
      ...(data.storage_location && { storage_location: data.storage_location }),
      ...(data.storage_number && { storage_number: data.storage_number })
    };
    
    const response = await fetch('/api/packages/checkin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('入库成功:', result);
  } catch (error) {
    console.error('快递入库失败:', error);
    throw error;
  }
}

/**
 * @description 快递出库
 * @param {PackageCheckOutFormData} data 快递出库表单数据
 * @returns {Promise<void>} 无返回值
 */
export async function checkoutPackage(data: PackageCheckOutFormData): Promise<void> {
  try {
    // 准备JSON数据
    const jsonData = {
      tracking_number: data.tracking_number,
      picked_up_by: data.picked_up_by,
      // 可选字段
      ...(data.notes && { notes: data.notes })
    };
    
    const response = await fetch(`/api/packages/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('出库成功:', result);
  } catch (error) {
    console.error('快递出库失败:', error);
    throw error;
  }
}

/**
 * @description 搜索快递
 * @param {Object} searchParams 搜索参数对象
 * @param {string} [searchParams.tracking_number] 快递单号
 * @param {string} [searchParams.carrier] 快递公司
 * @param {string} [searchParams.guest_name] 客人姓名
 * @param {string} [searchParams.room_number] 房间号
 * @param {string} [searchParams.guest_phone] 客人手机号
 * @param {string} [searchParams.status] 状态
 * @param {string} [searchParams.received_by] 收件人
 * @param {string} [searchParams.picked_up_by] 取件人
 * @returns {Promise<Package[]>} 搜索结果数组
 */
export async function searchPackage(searchParams: {
  tracking_number?: string;
  carrier?: string;
  guest_name?: string;
  room_number?: string;
  guest_phone?: string;
  status?: string;
  received_by?: string;
  picked_up_by?: string;
}): Promise<Package[]> {
  try {
    // 构建查询参数
    const queryParams = new URLSearchParams();
    if (searchParams.tracking_number) queryParams.append('tracking_number', searchParams.tracking_number);
    if (searchParams.carrier) queryParams.append('carrier', searchParams.carrier);
    if (searchParams.guest_name) queryParams.append('guest_name', searchParams.guest_name);
    if (searchParams.room_number) queryParams.append('room_number', searchParams.room_number);
    if (searchParams.guest_phone) queryParams.append('guest_phone', searchParams.guest_phone);
    if (searchParams.status) queryParams.append('status', searchParams.status);
    if (searchParams.received_by) queryParams.append('received_by', searchParams.received_by);
    if (searchParams.picked_up_by) queryParams.append('picked_up_by', searchParams.picked_up_by);
    
    const response = await fetch(`/api/packages/search?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('API返回数据:', data);
    
    // 检查数据结构，确保是数组
    if (data && data.data) {
      return data.data;
    } else {
      console.error('API返回数据格式不正确:', data);
      return [];
    }
  } catch (error) {
    console.error('搜索快递失败:', error);
    throw error;
  }
}