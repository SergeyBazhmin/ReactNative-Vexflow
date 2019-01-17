import React from 'react';
import {Text, View, Button, Picker, ToastAndroid} from 'react-native';
import {FileChooser, AndroidFS} from './NativePackages'
import {createStackNavigator} from 'react-navigation'

import VexMusicContainer from './main/VexMusicContainer';
import Renderer from './main/Renderer';

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
      else{
        this.props.navigation.navigate('Score', {
          response
        })
      }
    })
  }

  render() {
    ToastAndroid.show('awesome', ToastAndroid.SHORT)
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
      selectedPage: 0
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
      ToastAndroid.show(this.vexMusicContainer.drawables[len-1].page.toString(), ToastAndroid.SHORT)
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

  pageChanged(page) {
    this.setState({
      selectedPage: page,
    })
  }

  render() {
    const indices = []
    for (let i = 0; i <= this.state.pages;++i)
      indices.push(i)

    return (
      <View>
        <Picker style={{ height: 50, width: 100 }} selectedValue={this.state.selectedPage} onValueChange={(page) => this.pageChanged(page)}>
          { 
            this.state.pages ?
            indices
              .map((num, idx) => (<Picker.Item label={num.toString()} value={num} key={idx} />)) 
            :
            <Picker.Item label='0' value='0' />
          }
        </Picker>
        {this.renderer.render(this.vexMusicContainer.getMeasuresOnPage(this.state.selectedPage))}
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
export default AppNavigator
