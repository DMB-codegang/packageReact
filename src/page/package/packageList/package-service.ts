// 快递表单数据类型
export interface PackageFormData {
  tracking_number: string;
  carrier: string;
  guest_name: string;
  room_number: string;
  guest_phone?: string;
  notes?: string;
  storage_location?: string;
  storage_number?: string;
  // 拍照功能预留字段
  photo_files?: File[];
}

// 快递列表数据类型
export interface Package {
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
export async function checkinPackage(data: PackageFormData): Promise<void> {
  try {
    // 准备表单数据
    const formData = new FormData();
    formData.append('tracking_number', data.tracking_number);
    formData.append('carrier', data.carrier);
    formData.append('guest_name', data.guest_name);
    formData.append('room_number', data.room_number);
    
    // 可选字段
    if (data.guest_phone) formData.append('guest_phone', data.guest_phone);
    if (data.notes) formData.append('notes', data.notes);
    if (data.storage_location) formData.append('storage_location', data.storage_location);
    if (data.storage_number) formData.append('storage_number', data.storage_number);
    
    // 处理照片文件（拍照功能预留）
    if (data.photo_files && data.photo_files.length > 0) {
      data.photo_files.forEach((file, index) => {
        formData.append(`photo_files[${index}]`, file);
      });
    }
    
    const response = await fetch('/api/packages/checkin', {
      method: 'POST',
      body: formData,
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
