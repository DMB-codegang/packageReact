import { Tag } from 'antd';

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

export const packageColumns = [
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