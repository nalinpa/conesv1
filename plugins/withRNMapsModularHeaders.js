const { withPodfile } = require("@expo/config-plugins");

module.exports = function withRNMapsModularHeaders(config) {
  return withPodfile(config, (config) => {
    const podfile = config.modResults.contents;
    config.modResults.contents = podfile.replace(
      /post_install do \|installer\|/,
      `post_install do |installer|
  installer.pods_project.targets.each do |target|
    if target.name == 'react-native-maps'
      target.build_configurations.each do |config|
        config.build_settings['DEFINES_MODULE'] = 'YES'
      end
    end
  end`
    );
    return config;
  });
};