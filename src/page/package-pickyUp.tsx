import React from 'react';
import { Card, Table } from 'antd';
import type { ColumnType } from 'antd/es/table';

// 导入idb.tsx中定义的数据结构类型
interface PackageData {
  key: string;
  id?: number;
  recipientName: string;
  roomNo: number;
  phoneNumberEnding: string;
  companyName: string;
  packageReferenceNo: string;
  pieces: number;
  receivedBy: string;
  arrivalTime: Date;
  pickyUpTime?: Date;
  status: 'arrival' | 'pickup';
}

const PackagePickyUpPage: React.FC = () => {
  // 模拟数据，使用idb.tsx中定义的数据结构
  const data: PackageData[] = [
    { 
      key: '1', 
      id: 4, 
      recipientName: '赵六', 
      roomNo: 404, 
      phoneNumberEnding: '3456', 
      companyName: '顺丰速运', 
      packageReferenceNo: 'SF0987654321', 
      pieces: 1, 
      receivedBy: '管理员', 
      arrivalTime: new Date('2023-12-20'),
      pickyUpTime: new Date('2023-12-21'),
      status: 'pickup'
    },
    { 
      key: '2', 
      id: 5, 
      recipientName: '孙七', 
      roomNo: 505, 
      phoneNumberEnding: '7890', 
      companyName: '圆通快递', 
      packageReferenceNo: 'YT0123456789', 
      pieces: 1, 
      receivedBy: '管理员', 
      arrivalTime: new Date('2023-12-19'),
      pickyUpTime: new Date('2023-12-20'),
      status: 'pickup'
    },
  ];

  const columns: ColumnType<PackageData>[] = [
    { title: '收件人', dataIndex: 'recipientName', key: 'recipientName' },
    { title: '房间号', dataIndex: 'roomNo', key: 'roomNo' },
    { title: '手机号后四位', dataIndex: 'phoneNumberEnding', key: 'phoneNumberEnding' },
    { title: '快递公司', dataIndex: 'companyName', key: 'companyName' },
    { title: '快递单号', dataIndex: 'packageReferenceNo', key: 'packageReferenceNo' },
    { title: '件数', dataIndex: 'pieces', key: 'pieces' },
    { title: '接收人', dataIndex: 'receivedBy', key: 'receivedBy' },
    { 
      title: '入库时间', 
      dataIndex: 'arrivalTime', 
      key: 'arrivalTime',
      render: (text) => new Date(text).toLocaleString()
    },
    { 
      title: '取件时间', 
      dataIndex: 'pickyUpTime', 
      key: 'pickyUpTime',
      render: (text) => text ? new Date(text).toLocaleString() : '-'
    },
  ];

  return (
    <Card title="已取走快递列表" style={{ marginBottom: 16 }}>
      <Table dataSource={data} columns={columns} />
    </Card>
  );
};

export default PackagePickyUpPage;