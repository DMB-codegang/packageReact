import { useState, useEffect } from 'react';
import { Card, Table, Button, message, Modal, Spin, Tag } from 'antd';
import PackageForm from './package-form';
import { getPackageList, checkinPackage, checkoutPackage } from './package-service';
import type { PackageCheckInFormData } from './package-service';

interface Package {
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

const packageColumns = [
  {
    title: '快递单号',
    dataIndex: 'tracking_number',
    key: 'tracking_number',
  },
  {
    title: '快递公司',
    dataIndex: 'carrier',
    key: 'carrier',
    render: (carrier: string) => carrier || '未知',
  },
  {
    title: '收件人姓名',
    dataIndex: 'guest_name',
    key: 'guest_name',
    render: (guest_name: string) => guest_name || '未知',
  },
  {
    title: '房间号',
    dataIndex: 'room_number',
    key: 'room_number',
    render: (room_number: string) => room_number || '未知',
  },
  {
    title: '手机尾号',
    dataIndex: 'guest_phone',
    key: 'guest_phone',
    render: (guest_phone: string | null) => guest_phone || '无',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => {
      // 根据不同的状态值设置不同的Tag颜色
      let color = '';
      switch (status) {
        case '已领取':
          color = 'green';
          break;
        case '已接收':
          color = 'blue';
          break;
        case '异常':
          color = 'red';
          break;
        default:
          color = 'default';
      }
      return <Tag key={status} color={color}>{status}</Tag>;
    },
  },
  {
    title: '接收时间',
    dataIndex: 'receive_time',
    key: 'receive_time',
    render: (receive_time: string) => receive_time || '未知',
  },
  {
    title: '取件时间',
    dataIndex: 'pickup_time',
    key: 'pickup_time',
  },
  {
    title: '接收人',
    dataIndex: 'received_by',
    key: 'received_by',
    render: (received_by: string) => received_by || '未知',
  },
  {
    title: '取件人',
    dataIndex: 'picked_up_by',
    key: 'picked_up_by',
  },
  {
    title: '备注',
    dataIndex: 'notes',
    key: 'notes',
  },
]

function PackageListPage() {
  const [packagesList, setPackagesList] = useState<Package[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getPackageList();
        setPackagesList(data || []);
      } catch (error) {
        console.error('获取快递列表失败:', error);
        message.error('获取快递列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 打开手动添加弹窗
  const handleManualAdd = () => {
    setModalVisible(true);
  };

  // 关闭弹窗
  const handleCancel = () => {
    setModalVisible(false);
  };

  // 提交表单，调用入库API
  const handleSubmit = async (formData: PackageCheckInFormData) => {
    try {
      setFormLoading(true);
      await checkinPackage(formData);
      message.success('快递入库成功');
      setModalVisible(false);
      
      // 重新获取快递列表
      const data = await getPackageList();
      setPackagesList(data || []);
    } catch (error) {
      console.error('快递入库失败:', error);
      message.error('快递入库失败，请重试');
    } finally {
      setFormLoading(false);
    }
  };

  // 拍照添加功能预留
  const handlePhotoAdd = () => {
    message.info('拍照添加功能即将上线');
    // 这里可以后续扩展拍照功能
  };

  return (
    <Card>
      <Button 
        type="primary" 
        style={{ marginBottom: 16, float: 'right' }} 
        onClick={handlePhotoAdd}
      >
        拍照添加
      </Button>
      <Button 
        style={{ marginBottom: 16, float: 'right', marginRight: 8 }} 
        onClick={handleManualAdd}
      >
        手动添加
      </Button>
      <div style={{ clear: 'both' }} />
      <Spin spinning={loading}>
        <Table 
          columns={packageColumns} 
          dataSource={packagesList || []} 
          rowKey="id"
          components={{
            header: {
              cell: (props) => (
                <th {...props} style={{ fontSize: '12px' }} />
              ),
            },
          }}
        />
      </Spin>
      
      {/* 手动添加快递弹窗 */}
      <Modal
        title="手动添加快递"
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <PackageForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={formLoading}
        />
      </Modal>
    </Card>
  );
}

export default PackageListPage;