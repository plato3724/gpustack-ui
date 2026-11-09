import GpustackLogo from '@/assets/images/gpustack-logo.png';
import { PRODUCT_NAME } from '@/constants/product';
import { useLogo } from '@/hooks/use-logo';
import React from 'react';

const LogoIcon: React.FC = () => {
  const { sidebarLogo } = useLogo();

  if (sidebarLogo === GpustackLogo) {
    return <span className="sider-brand-name">{PRODUCT_NAME}</span>;
  }

  return (
    <img src={sidebarLogo} alt={PRODUCT_NAME} className="sider-brand-logo" />
  );
};

const SLogoIcon: React.FC = () => {
  const { miniLogo } = useLogo();

  return <img src={miniLogo} alt={PRODUCT_NAME} className="sider-brand-logo" />;
};

export { LogoIcon, SLogoIcon };
