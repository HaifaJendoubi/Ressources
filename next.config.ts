import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Autres configs si tu en as déjà (ex: images, experimental, etc.)

  webpack: (config) => {
    // Ajoute l'alias @ → src/
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };

    return config;
  },
};

export default nextConfig;