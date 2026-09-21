import RouteTracker from '@/app/routes/RouteTracker';
import I18nSync from '@/components/shared/i18n/I18nSync';
import React from 'react'
import { Outlet } from 'react-router-dom';

export default function MainLayout({children}) {
    return (
      <div>
        <RouteTracker />
        <I18nSync />
        <Outlet />
        {children}
      </div>
    );
}
