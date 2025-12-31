// 快递入库表单数据类型
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

// 快递出库表单数据类型
export type PackageCheckOutFormData = {
  tracking_number: string;
  picked_up_by: string;
  notes?: string;
}

// 快递列表数据类型
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

// 获取快递列表
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

// 快递入库
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

// 快递出库
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