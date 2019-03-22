import React, { Component } from 'react';
import { FileChooser } from '../NativePackages';
import { View, Button, ToastAndroid, AsyncStorage } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Card } from 'react-native-elements';


export default class HomeScreen extends Component {
    static navigationOptions = {
        title: 'My Scores'
    }
    constructor(props) {
      super(props);
      this.state = {
          items: []
      };
	  
	  //MicrophoneListener.setBufferSize(1024);
	  //DeviceEventEmitter.addListener('onNewSoundData', (e)=>{ this.onNewSoundData(e);});
    }
	
    // onNewSoundData(e) {
    //   var data = e.data;
    // }
    
    // start() {
    //   MicrophoneListener.start();
    // }
    
    // stop() {
    //   MicrophoneListener.stop();
    // }
    
    async componentWillMount() {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const tuples = await AsyncStorage.multiGet(keys);
            let items = tuples.map((result, i, store) => JSON.parse(store[i][1]));
            items = items.map((item, idx) => ({...item, key: keys[idx]}));
            this.setState({
                items
            });
        } catch(error) {
            ToastAndroid.show(error.message, ToastAndroid.SHORT);
        }
    }

    _uniqueID() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    async _removeFile(removed) {
        try{
            await AsyncStorage.removeItem(removed.key);
            const filtered = this.state.items.filter(item => item.key != removed.key);
            this.setState({
                items: filtered
            });
        } catch (error) {
            ToastAndroid.show(error.message, ToastAndroid.SHORT);
        }
    }

    _handleSelection() {
      const options = {
        title: 'File Chooser'
      };
  
      FileChooser.show(options, response => {
        if (response.didCancel) {
          ToastAndroid.show('canceled', ToastAndroid.SHORT);
        }
        else if (response.error) {
          ToastAndroid.show(response.error, ToastAndroid.SHORT);
        }
        else {
            const {fileName, uri} = response;
            const key = `${fileName}${this._uniqueID()}`;
            this.setState({
                items: [...this.state.items, {key, fileName, uri}]
            }, () => AsyncStorage.setItem(key, JSON.stringify({fileName, uri})));
        }
      });
    }

    _openFile(uri) {
      //ToastAndroid.show(uri, ToastAndroid.SHORT)
      this.props.navigation.navigate('Score', { uri });
    }
  
    render() {
      return (
        <View style={{ flex: 1}}>
            <ScrollView>
                { this.state.items.map(item => 
                    <Card title={item.fileName} style={{padding:10}}>
                        <Button onPress={() => this._openFile(item.uri)} title='Open'/>
                        <Button onPress={() => this._removeFile(item)} title='Remove'/>
                    </Card>)
                }
            </ScrollView>
          <Button title='Choose file' onPress={() => this._handleSelection()} />
        </View>
      );
    }
  }
