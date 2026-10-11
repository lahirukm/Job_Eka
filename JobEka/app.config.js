// JobEka — build settings on top of app.json.
// Google Maps key comes from EAS (expo.dev → Environment variables), not from this file.
// iPhone uses Apple Maps (free, no key needed).
export default ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    package: "com.lahirukm.jobeka",
    config: {
      ...(config.android?.config || {}),
      googleMaps: { apiKey: process.env.GOOGLE_MAPS_API_KEY || "" },
    },
  },
  ios: {
    ...config.ios,
    bundleIdentifier: "com.lahirukm.jobeka",
    supportsTablet: true,
    infoPlist: {
      ...(config.ios?.infoPlist || {}),
      NSLocationWhenInUseUsageDescription: "JobEka uses your location to show nearby jobs and service providers.",
      NSPhotoLibraryUsageDescription: "JobEka lets you choose a profile picture, job banner or CV photo.",
      NSCameraUsageDescription: "JobEka uses the camera for video interviews and photos.",
      NSMicrophoneUsageDescription: "JobEka uses the microphone for video interviews.",
      ITSAppUsesNonExemptEncryption: false,
    },
  },
});