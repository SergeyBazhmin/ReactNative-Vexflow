import {NativeModules} from 'react-native'

const FileChooser = NativeModules.FileChooser
const AndroidFS = NativeModules.AndroidFileSystem

module.exports = {
    FileChooser,
    AndroidFS
}