import React from 'react';
import {Text, View, Button, Picker, ToastAndroid, TouchableOpacity, StyleSheet} from 'react-native'
import {FileChooser, AndroidFS} from './NativePackages'
import {createStackNavigator} from 'react-navigation'

import VexMusicContainer from './main/VexMusicContainer'
import Renderer from './main/Renderer'
import { TextInput } from 'react-native-gesture-handler';

class HomeScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  _handleSelection() {
    const options = {
      title: 'File Chooser'
    }

    FileChooser.show(options, response => {
      if (response.didCancel) {
        ToastAndroid.show('canceled', ToastAndroid.SHORT)
      }
      else if (response.error) {
        ToastAndroid.show(response.error, ToastAndroid.SHORT)
      }
      else {
        this.props.navigation.navigate('Score', {
          response
        })
      }
    })
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Home Screen</Text>
        <Button title='Choose file' onPress={() => this._handleSelection()} />
      </View>
    );
  }
}

class ScoreScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pages: null,
      selectedPage: 0,
      staves: null,
      selectedStave: -1,
      bpm: 120
    }

    this.vexMusicContainer = new VexMusicContainer()
    this.renderer = new Renderer()

    const uri = this.props.navigation.getParam('response').uri
    AndroidFS.read(uri)
    .then(xmlContent => {
      this.vexMusicContainer.loadFromString(xmlContent)
      //this.renderer.setDrawables(this.musicContainer)
      this.vexMusicContainer.adjust(
        this.renderer.options,
        this.renderer.formatter
      )
      const len = this.vexMusicContainer.drawables.length
      //ToastAndroid.show(this.renderer.options.stavesPerPage.toString(), ToastAndroid.SHORT)
      //ToastAndroid.show(this.vexMusicContainer.drawables[len-1].page.toString(), ToastAndroid.SHORT)
      this.setState({
        pages: this.vexMusicContainer.drawables[len-1].page
      })
    },
    error => {
      ToastAndroid.show(error.message, ToastAndroid.SHORT)
    })
    .catch(reason => {
      ToastAndroid.show(reason.message, ToastAndroid.SHORT)
    })
  }

  _pageChanged(page) {
    this.setState({
      selectedPage: page,
      selectedStave: -1,
      staves: this.renderer.render(this.vexMusicContainer.getMeasuresOnPage(page))
    })
  }

  _stavePressed(id) {
    this.setState({
      selectedStave: id
    })
  }

  _handleInput(txt) {
    this.setState({
      bpm: txt == '' ? 0 : parseInt(txt)
    })
  }

  render() {
    const indices = []
    for (let i = 0; i <= this.state.pages;++i)
      indices.push(i)

    return (
      <View>
        <View style = {styles.head}>
          <Picker style={{width: 100}}selectedValue={this.state.selectedPage} onValueChange={(page) => this._pageChanged(page)}>
            { 
              this.state.pages ?
              indices.map((num, idx) => (<Picker.Item label={num.toString()} value={num} key={idx} />)) 
              :
              <Picker.Item label='0' value='0' />
            }
          </Picker>
          <TextInput style={styles.bpmInput} placeholder='bpm' onChangeText={(txt) => this._handleInput(txt)} value={this.state.bpm}></TextInput>
        </View>
        <View>
          {this.state.staves ? this.state.staves.map((svgElement, idx) => 
            (<View style={idx == this.state.selectedStave ? styles.chosenStave : {}}>
              <TouchableOpacity onPress = {(e) => this._stavePressed(idx)}>{svgElement}</TouchableOpacity>
            </View>)) : null }
        </View>
      </View>
    )
  }

}

const AppNavigator = createStackNavigator({
    Home:{
      screen: HomeScreen
    },
    Score: {
      screen: ScoreScreen
    }
  },
  {
    initialRouteName: 'Home'
  }
)

const styles = StyleSheet.create({
  chosenStave: {
    borderColor: 'red',
    borderWidth: 1
  },
  head: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection:'row'
  },
  bpmInput: {
    borderColor: '#7a42f4',
    borderWidth: 1,
    width:100
 },
})

export default AppNavigator
