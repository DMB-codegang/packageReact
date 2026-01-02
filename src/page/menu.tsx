import type { MenuProps } from 'antd';
import {
  DropboxOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';

type MenuItem = Required<MenuProps>['items'][number];

export const items: MenuItem[] = [
  { key: 'package', icon: <DropboxOutlined />, label: '快递管理', children: [
    { key: 'package-list', label: '库中快递列表&添加快递' },
    { key: 'package-pickyUp', label: '出库快递列表&出库快递' },
  ]}
];

// MenuComponent组件属性类型
interface MenuComponentProps {
  onSelect?: MenuProps['onSelect'];
  selectedKeys?: string[];
}

function MenuComponent({ onSelect, selectedKeys }: MenuComponentProps) {
    return (
        <div>
            <Menu
                theme="dark"
                selectedKeys={selectedKeys}
                defaultOpenKeys={['package']}
                mode="inline"
                items={items}
                onSelect={onSelect}
            />
        </div>
    )
}


export default MenuComponent;
