import { useState } from 'react';
import { Form, Input, Select, Button, Space, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

// 表单数据类型定义
interface PackageFormData {
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

// 快递公司选项
const carrierOptions = [
  { value: '顺丰速运', label: '顺丰速运' },
  { value: '中通快递', label: '中通快递' },
  { value: '圆通快递', label: '圆通快递' },
  { value: '申通快递', label: '申通快递' },
  { value: '韵达快递', label: '韵达快递' },
  { value: '百世快递', label: '百世快递' },
  { value: '京东物流', label: '京东物流' },
  { value: '邮政快递', label: '邮政快递' },
];

interface PackageFormProps {
  onSubmit: (data: PackageFormData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const PackageForm = ({ onSubmit, onCancel, loading }: PackageFormProps) => {
  const [form] = Form.useForm<PackageFormData>();

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

  // 处理文件上传（拍照功能预留）
  const handleUpload = (file: File) => {
    // 这里可以添加拍照或文件上传的逻辑
    console.log('上传的文件:', file);
    return false; // 返回false阻止自动上传
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{ carrier: '顺丰速运' }}
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
        <Select options={carrierOptions} placeholder="请选择快递公司" />
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
      </Form.Item>

      <Form.Item
        name="notes"
        label="备注"
      >
        <Input.TextArea placeholder="请输入备注信息（可选）" rows={3} />
      </Form.Item>

      {/* 拍照功能预留 - 可以扩展为调用摄像头拍照 */}
      <Form.Item
        label="快递拍照"
        extra="可以拍摄快递照片用于存档"
      >
        <Upload
          beforeUpload={handleUpload}
          showUploadList={false}
          accept="image/*"
        >
          <Button icon={<UploadOutlined />}>点击上传/拍照</Button>
        </Upload>
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
