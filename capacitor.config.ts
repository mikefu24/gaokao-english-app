import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gaokao.english',
  appName: '高考英语',
  webDir: 'dist',
  server: {
    // Use https scheme on Android so that fetch() and audio src work correctly
    androidScheme: 'https',
  },
  android: {
    // Allow HTTP traffic to Anthropic API (handled via network security config)
    allowMixedContent: false,
  },
};

export default config;
