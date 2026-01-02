import { useState } from 'react';
import MenuComponent from './menu'
import { Breadcrumb, Layout, theme } from 'antd';
import PackageListPage from './package/packageList/package-list';
import PackagePickyUpPage from './package-pickyUp';
const { Content, Sider } = Layout;
import type { MenuProps } from 'antd';

// 菜单项类型定义
type MenuKey = 'package-list' | 'package-pickyUp';

// 页面组件映射
const PageComponents: Record<MenuKey, React.ReactNode> = {
  'package-list': <PackageListPage />,
  'package-pickyUp': <PackagePickyUpPage />,
};

function IndexPage() {
    const [collapsed, setCollapsed] = useState(false);
    const [selectedKey, setSelectedKey] = useState<MenuKey>('package-list');
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    // 菜单选择事件处理
    const handleMenuSelect: MenuProps['onSelect'] = (e) => {
        setSelectedKey(e.key as MenuKey);
    };

    return (
        <>
            <Layout style={{ minHeight: '100vh', display: 'flex' }}>
                <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                        <h1 style={{ color: 'white', textAlign: 'center', padding: '16px 0', fontSize: '24px' }}>快递管理系统</h1>
                        <MenuComponent onSelect={handleMenuSelect} selectedKeys={[selectedKey]} />
                        {/* <div className="demo-logo-vertical" />
                    <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} /> */}
                </Sider>
                <Layout style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* <Header style={{ padding: '0 24px', background: colorBgContainer, minHeight: 64 }}></Header> */}
                    <Content style={{ padding: '16px 24px' }}>
                        {/* <Breadcrumb style={{ margin: '0 0 16px 0' }} 
                            items={[
                                { title: '首页' },
                                { title: '快递管理' },
                                { title: selectedKey === 'package-list' ? '快递列表&添加快递' : '已取走快递列表' }
                            ]} 
                        /> */}
                        <div
                            style={{
                                padding: 24,
                                minHeight: 360,
                                background: colorBgContainer,
                                borderRadius: borderRadiusLG,
                            }}
                        >
                            {PageComponents[selectedKey]}
                        </div>
                    </Content>
                </Layout>
            </Layout>
        </>
    )
}

export default IndexPage;
