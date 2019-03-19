import {NativeModules} from 'react-native'

const FileChooser = NativeModules.FileChooser;
const AndroidFS = NativeModules.AndroidFileSystem;
const MicrophoneListener = NativeModules.MicrophoneListener;
const MusicPosition = NativeModules.MusicPosition;

module.exports = {
    FileChooser,
    AndroidFS,
	MicrophoneListener,
	MusicPosition
};