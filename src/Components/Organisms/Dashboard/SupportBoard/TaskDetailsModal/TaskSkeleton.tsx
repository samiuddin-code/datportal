import { Skeleton } from "antd"

export const TaskSkeleton = () => {
    return (
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div style={{ width: '65%' }}>
                <Skeleton active round paragraph={{ rows: 0 }} style={{ width: 400 }} />
                <Skeleton.Input active style={{ width: 600 }} />
                <Skeleton active round paragraph={{ rows: 4 }} style={{ width: '100%', marginTop: '3rem' }} />
                <Skeleton active round paragraph={{ rows: 0 }} style={{ width: 400, marginTop: '3rem' }} />
                <Skeleton.Node active />
            </div>
            <div style={{ width: '35%' }}>
                <Skeleton.Button active style={{ width: 100 }} />
                <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '2rem', border: '1px solid var(--color-light)', borderRadius: '0.25rem', padding: '0.5rem' }}>
                    <Skeleton active round paragraph={{ rows: 5 }} style={{ width: '50%' }} />
                    <Skeleton active round paragraph={{ rows: 5 }} style={{ width: '50%' }} />
                </div>
            </div>
        </div>
    )
}