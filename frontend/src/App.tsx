import React from 'react'
import { RouterProvider, createRootRoute, createRoute, createRouter, Outlet, Navigate } from '@tanstack/react-router'
import LayoutShell from './layout/LayoutShell'
import EmbedPage from './routes/EmbedPage'
import ExtractPage from './routes/ExtractPage'
import BatchPage from './routes/BatchPage'
import AnalysisPage from './routes/AnalysisPage'

const rootRoute = createRootRoute({
  component: () => (
    <LayoutShell>
      <React.Suspense fallback={null}>
        <Outlet />
      </React.Suspense>
    </LayoutShell>
  ),
})

const embedRoute = createRoute({ getParentRoute: () => rootRoute, path: '/embed', component: EmbedPage })
const extractRoute = createRoute({ getParentRoute: () => rootRoute, path: '/extract', component: ExtractPage })
const batchRoute = createRoute({ getParentRoute: () => rootRoute, path: '/batch', component: BatchPage })
const analysisRoute = createRoute({ getParentRoute: () => rootRoute, path: '/analysis', component: AnalysisPage })
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <Navigate to="/embed" />,
})

const routeTree = rootRoute.addChildren([indexRoute, embedRoute, extractRoute, batchRoute, analysisRoute])

const routerInstance = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof routerInstance
  }
}

export default function App() {
  return (
    <RouterProvider router={routerInstance} />
  )
}
