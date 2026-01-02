import { useState, useEffect } from 'react';
import { Button, Card, Table } from 'antd'

import { searchPackage } from '../packageList/package-service';

import { packageColumns } from '../tableType';
import type { Package } from '../tableType';

function PackagePickyUpPage() {
    const [packagesList, setPackagesList] = useState<Package[]>([]);
    useEffect(() => {
        // 从数据库获取数据
        const fetchPackages = async () => {
            const data = await searchPackage({
                status: '已领取',
            });
            setPackagesList(data);
        };
        fetchPackages();
    }, []);
    return (
        <Card>
            <Button type="primary" style={{ marginBottom: 16, float: 'right', marginRight: 8 }} >领取快递</Button>
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
        </Card>
    )
}

export default PackagePickyUpPage