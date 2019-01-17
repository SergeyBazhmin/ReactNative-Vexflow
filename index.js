import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
//react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
AppRegistry.registerComponent(appName, () => App);
