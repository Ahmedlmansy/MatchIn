
import AuthLayout from '@/components/layouts/auth/AuthLayout';
import React from 'react'

export default function LoginPage() {
    return (
      <div>
        <AuthLayout
          sidePanel={{
            imageSrc:
              "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
            badgeText: "sub Title",
            title: "Title",
            description: "description",
          }}
          brand={"logo"}
          topRight={"compoents"}
          footer={<>compoents</>}
        >
          test
        </AuthLayout>
      </div>
    );
}
