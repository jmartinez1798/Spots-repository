module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        blocklist: null,
        allowlist: [
          'MAPS_API_KEY',
          'BASE_URL',
          'ZEGO_CLOUD_APPID',
          'ZEGO_CLOUD_APPSIGN',
        ],
        blacklist: null,
        whitelist: null,
        safe: true,
        allowUndefined: false,
        verbose: false,
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
