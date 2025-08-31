import React from 'react'
import { Layout, Menu, Button, Typography, ConfigProvider, Tooltip } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DeploymentUnitOutlined,
  LockOutlined,
  DatabaseOutlined,
  FundViewOutlined,
} from '@ant-design/icons'
import { useRouter, useRouterState } from '@tanstack/react-router'

const { Header, Sider, Content } = Layout

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(
    localStorage.getItem('layout_sider_collapsed') === 'true'
  )
  const router = useRouter()
  const state = useRouterState()
  const path = state.location.pathname

  React.useEffect(() => {
    localStorage.setItem('layout_sider_collapsed', sidebarCollapsed.toString())
  }, [sidebarCollapsed])

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault()
            setSidebarCollapsed(!sidebarCollapsed)
            break
          case 'e':
            e.preventDefault()
            if (path === '/embed') {
              // Mock embed action - to be implemented in actual page
              console.log('Embed shortcut triggered')
            }
            break
          case 'x':
            e.preventDefault()
            if (path === '/extract') {
              // Mock extract action - to be implemented in actual page
              console.log('Extract shortcut triggered')
            }
            break
          case 's':
            e.preventDefault()
            // Mock save stego - to be implemented
            console.log('Save stego shortcut triggered')
            break
          case 'p':
            e.preventDefault()
            // Mock preview overlay - to be implemented
            console.log('Preview overlay shortcut triggered')
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [path, sidebarCollapsed])

  const items = [
    { key: '/embed', icon: <DeploymentUnitOutlined />, label: 'Nhúng' },
    { key: '/extract', icon: <LockOutlined />, label: 'Giải' },
    { key: '/batch', icon: <DatabaseOutlined />, label: 'Chạy lô' },
    { key: '/analysis', icon: <FundViewOutlined />, label: 'Phân tích' },
  ]

  const onMenuClick = (e: any) => router.navigate({ to: e.key })

  const theme = {
    token: {
      colorPrimary: '#1d2769',
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#ff4d4f',
      colorInfo: '#1890ff',
      borderRadius: 6,
      wireframe: false,
    },
    components: {
      Layout: {
        headerBg: '#ffffff',
        siderBg: '#ffffff',
        bodyBg: '#f5f5f5',
      },
      Menu: {
        itemBg: 'transparent',
        itemSelectedBg: '#e6f7ff',
        itemSelectedColor: '#1d2769',
      },
      Button: {
        borderRadius: 6,
      },
      Card: {
        borderRadius: 8,
      },
    },
  }

  return (
    <ConfigProvider theme={theme}>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          collapsible
          collapsed={sidebarCollapsed}
          trigger={null}
          width={250}
          style={{ background: '#ffffff', borderRight: '1px solid #f0f0f0' }}
        >
          {/* Sider Header */}
          <div
            style={{
              padding: 16,
              borderBottom: '1px solid #f0f0f0',
              textAlign: 'center',
            }}
          >
            {!sidebarCollapsed && (
              <Typography.Title level={4} style={{ margin: 0, color: '#1d2769' }}>
                Xử lý giấu tin
              </Typography.Title>
            )}
          </div>

          {/* Menu */}
          <Menu
            mode="inline"
            selectedKeys={[path]}
            items={items.map((item) => ({
              ...item,
              label: sidebarCollapsed ? (
                <Tooltip placement="right" title={item.label}>
                  <span>{item.label}</span>
                </Tooltip>
              ) : (
                item.label
              ),
            }))}
            onClick={onMenuClick}
            style={{ borderRight: 0 }}
          />

        </Sider>

        <Layout>
          <Header
            style={{
              padding: '0 16px',
              background: '#ffffff',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button
                type="text"
                icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                style={{
                  width: 64,
                  height: 64,
                  fontSize: 16,
                }}
              />
              <Typography.Title level={3} style={{ margin: 0, color: '#1d2769' }}>
                Hệ thống xử lý giấu tin — Adaptive Image Complexity
              </Typography.Title>
            </div>
            <div style={{ color: '#666' }}>
              Người dùng: Demo | {new Date().toLocaleDateString('vi-VN')}
            </div>
          </Header>

          <Content
            style={{
              margin: '8px 16px',
              padding: '8px 16px',
              background: '#ffffff',
              borderRadius: 8,
              height: 'calc(100vh - 80px)',
              overflow: 'auto',
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  )
}


