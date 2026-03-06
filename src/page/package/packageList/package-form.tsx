import { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Space } from 'antd';
import pinyin from 'pinyin';

/**
 * @description 包裹表单数据类型定义
 * @param {string} tracking_number 快递单号
 * @param {string} carrier 快递公司
 * @param {string} guest_name 收件人姓名
 * @param {string} room_number 房间号
 * @param {string} guest_phone 收件人手机号
 * @param {string} received_by 接收人
 * @param {string} notes 备注
 * @param {string} storage_location 存储位置
 * @param {string} storage_number 存储号
 * @param {File[]} photo_files 照片文件数组
 */
interface PackageFormData {
  tracking_number: string;
  carrier: string;
  guest_name: string;
  room_number: string;
  guest_phone?: string;
  received_by: string;
  notes?: string;
  storage_location?: string;
  storage_number?: string;
  // 拍照功能预留字段
  photo_files?: File[];
}

// 快递公司选项
const carrierOptions = [
  { value: '顺丰', label: '顺丰' },
  { value: '中通', label: '中通' },
  { value: '圆通', label: '圆通' },
  { value: '申通', label: '申通' },
  { value: '韵达', label: '韵达' },
  { value: '百世', label: '百世' },
  { value: '京东', label: '京东' },
  { value: '邮政', label: '邮政' },
  { value: 'other', label: '其他' },
];

interface PackageFormProps {
  onSubmit: (data: PackageFormData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  initialValues?: Partial<PackageFormData>;
}

const PackageForm = ({ onSubmit, onCancel, loading, initialValues }: PackageFormProps) => {
  const [form] = Form.useForm<PackageFormData>();
  const [receivedByOptions, setReceivedByOptions] = useState<{ value: string; label: string }[]>([]);
  
  // 当initialValues变化时，更新表单值
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  // 从localStorage加载保存的接收人列表
  useEffect(() => {
    const saved = localStorage.getItem('receivedByList');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 清理可能存在的空白tag
        const cleanedOptions = parsed.filter((option: { value: string; label: string }) => {
          return option.value && 
                 typeof option.value === 'string' && 
                 option.value.trim().length > 0 &&
                 !/^\s+$/.test(option.value);
        });
        
        // 如果有清理过的数据，更新localStorage
        if (cleanedOptions.length !== parsed.length) {
          localStorage.setItem('receivedByList', JSON.stringify(cleanedOptions));
        }
        
        setReceivedByOptions(cleanedOptions);
      } catch (e) {
        console.error('解析接收人列表失败:', e);
      }
    }
  }, []);

  // 保存接收人到localStorage
  const saveReceivedBy = (name: string) => {
    // 检查输入是否有效
    if (!name || typeof name !== 'string') return;
    
    // 去除空白并检查是否为空
    const trimmedName = name.trim();
    if (trimmedName.length === 0) return;
    
    // 检查是否只包含空白字符
    if (/^\s+$/.test(name)) return;
    
    // 检查是否已存在（不区分大小写）
    if (!receivedByOptions.some(option => option.value.toLowerCase() === trimmedName.toLowerCase())) {
      const newOptions = [...receivedByOptions, { value: trimmedName, label: trimmedName }];
      setReceivedByOptions(newOptions);
      localStorage.setItem('receivedByList', JSON.stringify(newOptions));
    }
  };

  // 处理接收人选择变化
  const handleReceivedByChange = (value: string | string[]) => {
    // 处理tags模式下的多值输入
    if (Array.isArray(value)) {
      // 过滤掉空白值
      const filteredValues = value.filter(v => v && v.trim().length > 0);
      // 只保存最后一个非空值（通常是最新输入的）
      if (filteredValues.length > 0) {
        saveReceivedBy(filteredValues[filteredValues.length - 1]);
      }
    } else {
      // 单值模式
      saveReceivedBy(value);
    }
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ carrier: '顺丰' }}
    >
      <Form.Item
        name="tracking_number"
        label="快递单号"
        rules={[{ required: true, message: '请输入快递单号' }]}
      >
        <Input placeholder="请输入快递单号" />
      </Form.Item>

      <Form.Item
        name="carrier"
        label="快递公司"
        rules={[{ required: true, message: '请选择快递公司' }]}
      >
        <Select
          options={carrierOptions}
          placeholder="请选择快递公司"
          showSearch={{
            optionFilterProp: 'label',
          }}
          filterOption={(input, option) => {
            if (!option?.label) return false;
            const label = option.label.toString();
            const inputValue = input.toLowerCase();
            
            // 支持全名搜索
            if (label.toLowerCase().includes(inputValue)) return true;
            
            // 支持拼音首字母搜索
            const pinyinArray = pinyin(label, {
              style: pinyin.STYLE_FIRST_LETTER,
              heteronym: false,
            });
            const firstLetters = pinyinArray.flat().join('').toLowerCase();
            
            return firstLetters.includes(inputValue);
          }}
        />
      </Form.Item>

      <Form.Item
        name="guest_name"
        label="收件人姓名"
        rules={[{ required: true, message: '请输入收件人姓名' }]}
      >
        <Input placeholder="请输入收件人姓名" />
      </Form.Item>

      <Form.Item
        name="room_number"
        label="房间号"
        rules={[{ required: true, message: '请输入房间号' }]}
      >
        <Input placeholder="请输入房间号" />
      </Form.Item>

      <Form.Item
        name="guest_phone"
        label="联系电话"
      >
        <Input placeholder="请输入联系电话（可选）" />
      </Form.Item>

      <Form.Item
        name="received_by"
        label="接收人"
        rules={[{ required: true, message: '请选择接收人' }]}
      >
        <Select
          options={receivedByOptions}
          placeholder="请选择或输入接收人"
          showSearch
          allowClear
          mode='tags'
          filterOption={(input, option) => {
            if (!option?.label) return false;
            return option.label.toLowerCase().includes(input.toLowerCase());
          }}
          onChange={handleReceivedByChange}
          onBlur={() => {
            const value = form.getFieldValue('received_by');
            saveReceivedBy(value);
          }}
        />
      </Form.Item>

      {/* <Form.Item
        name="storage_location"
        label="存储位置"
      >
        <Input placeholder="请输入存储位置（可选）" />
      </Form.Item>

      <Form.Item
        name="storage_number"
        label="存储编号"
      >
        <Input placeholder="请输入存储编号（可选）" />
      </Form.Item> */}

      <Form.Item
        name="notes"
        label="备注"
      >
        <Input.TextArea placeholder="请输入备注信息（可选）" rows={3} />
      </Form.Item>

      <Form.Item>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            提交
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default PackageForm;
