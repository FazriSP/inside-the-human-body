import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/app/AppShell';
import { BerandaPage } from '@/pages/BerandaPage';
import { EksplorasiPage } from '@/pages/EksplorasiPage';
import { OrganDetailPage } from '@/pages/OrganDetailPage';
import { MateriPage } from '@/pages/MateriPage';
import { SimulasiPage } from '@/pages/SimulasiPage';
import { KuisPage } from '@/pages/KuisPage';
import { KreditPage } from '@/pages/KreditPage';

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <BerandaPage /> },
      { path: 'eksplorasi', element: <EksplorasiPage /> },
      { path: 'organ/:organId', element: <OrganDetailPage /> },
      { path: 'perjalanan', element: <Navigate to="/simulasi" replace /> },
      { path: 'materi', element: <MateriPage /> },
      { path: 'simulasi', element: <SimulasiPage /> },
      { path: 'kuis', element: <KuisPage /> },
      { path: 'kredit', element: <KreditPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
