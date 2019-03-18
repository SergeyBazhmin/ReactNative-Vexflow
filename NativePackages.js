import {NativeModules} from 'react-native'

const FileChooser = NativeModules.FileChooser;
const AndroidFS = NativeModules.AndroidFileSystem;
const MicrophoneListener = NativeModules.MicrophoneListener;

module.exports = {
    FileChooser,
    AndroidFS,
	MicrophoneListener
};