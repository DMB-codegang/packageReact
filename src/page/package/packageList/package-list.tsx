import { useState, useEffect } from 'react';
import { Card, Table, Button, message, Modal, Spin } from 'antd';
import PackageForm from './package-form';
import { getPackageList, checkinPackage } from './package-service';
import type { PackageCheckInFormData } from './package-service';
import { packageColumns } from '../tableType';
import type { Package } from '../tableType';


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