import type { MenuProps } from 'antd';
import {
  DropboxOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';

type MenuItem = Required<MenuProps>['items'][number];

export const items: MenuItem[] = [
  { key: 'package', icon: <DropboxOutlined />, label: '快递管理', children: [
    { key: 'package-list', label: '快递列表' },
    { key: 'package-pickyUp', label: '已取走快递列表' },
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
