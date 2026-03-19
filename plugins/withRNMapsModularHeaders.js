const { withPodfile } = require("@expo/config-plugins");

module.exports = function withRNMapsModularHeaders(config) {
  return withPodfile(config, (config) => {
    const contents = config.modResults.contents;

    const patch = `
  installer.pods_project.targets.each do |target|
    if target.name == 'react-native-maps'
      target.build_configurations.each do |build_config|
        build_config.build_settings['DEFINES_MODULE'] = 'YES'
      end
    end
  end`;

    // Try to insert before the end of post_install block
    if (contents.includes("post_install do |installer|")) {
      config.modResults.contents = contents.replace(
        "post_install do |installer|",
        `post_install do |installer|\n${patch}`
      );
    } else {
      // No post_install block exists, add one before the final 'end'
      config.modResults.contents =
        contents +
        `\npost_install do |installer|\n${patch}\nend\n`;
    }

    return config;
  });
};