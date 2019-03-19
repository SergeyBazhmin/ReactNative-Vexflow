import React from 'react';
import { View, Button, Picker, ToastAndroid, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { AndroidFS, MicrophoneListener, MusicPosition } from '../NativePackages';

import VexMusicContainer from '../main/VexMusicContainer';
import Renderer from '../main/Renderer';
import { TextInput } from 'react-native-gesture-handler';
import Menu, { MenuItem } from 'react-native-material-menu';

export default class ScoreScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: 'Score',
      headerRight: (
        <View style={{paddingRight: 10}}>
          <Menu ref={navigation.getParam('_setMenuRef')}
          button={<Text style={{fontSize: 20}} onPress={navigation.getParam('_showMenu')}>Mode</Text>}>
                <MenuItem onPress={navigation.getParam('_hideMenu')}>Timer</MenuItem>
                <MenuItem onPress={navigation.getParam('_hideMenu')}>Listen</MenuItem>
          </Menu>
        </View>
      ),
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      pages: 0,
      selectedPage: 0,
      staves: null,
      selectedStave: -1,
      bpm: 120,
      listening: false
    };

    this._showMenu = this._showMenu.bind(this);
    this._setMenuRef = this._setMenuRef.bind(this);

    DeviceEventEmitter.addListener('onNewSoundData', (e)=>{ this.onNewSoundData(e);});
    DeviceEventEmitter.addListener('onTactChanged', (e)=>{ this.onTactChanged(e);});
  }

  onNewSoundData(e){
    var data = e.data;
	MusicPosition.onNewSoundData(data)
  }

  onTactChanged(e){
    if (e == Math.ceil(this.vexMusicContainer.stavesNumber / measuresPerStave)) {
        this._stop();
    }
    else if ((e + 1) % this.renderer.options.stavesPerPage == 0) {
        this._pageChanged(this.state.selectedPage + 1, true);
    }
    else {
      this.setState({
        selectedStave: e
    });
  }

  componentDidMount() {
    this.props.navigation.setParams({
      _setMenuRef: this._setMenuRef,
      _showMenu: this._showMenu,
      _hideMenu: this._hideMenu
    });

    this.vexMusicContainer = new VexMusicContainer();
    this.renderer = new Renderer();
    this._menu = null;


    const uri = this.props.navigation.getParam('uri');
    AndroidFS.read(uri)
    .then(xmlContent => {
      this.vexMusicContainer.loadFromString(xmlContent);
      this.vexMusicContainer.adjust(
        this.renderer.options,
        this.renderer.formatter
      );
      const len = this.vexMusicContainer.drawables.length;
      this.setState({
        pages: this.vexMusicContainer.drawables[len-1].page+1
      });
    })
    .catch(reason => {
      ToastAndroid.show(reason.message, ToastAndroid.SHORT);
    });

    MusicPosition.init(vexMusicContainer.allNotes)
    MicrophoneListener.setBufferSize(2048 + 16);//тот самый размер буфера, который надо задавать
  }

  _setMenuRef(ref) {
    this._menu = ref;
  }

  _hideMenu() {
    this._menu.hide();
    const notes = this.vexMusicContainer.allNotes; //new property
    let str = '';
    const measureIdx = 0;
    notes[measureIdx].forEach(note => {
       str += note.duration.toString();
       //note.keys ... 'D/4', 'F/4' etc
     });
     ToastAndroid.show(str, ToastAndroid.SHORT);
  }

  _showMenu() {
    this._menu.show();
  }

  _pageChanged(page, selectFirst=false) {
    ToastAndroid.show(page.toString(), ToastAndroid.SHORT);
    this.setState({
      selectedPage: page,
      selectedStave: selectFirst ? 0 : -1,
      staves: this.renderer.render(this.vexMusicContainer.getMeasuresOnPage(page))
    });
  }

  _stavePressed(id) {
    this.setState({
      selectedStave: this.state.selectedStave == id ? -1 : id
    });
  }

  _handleInput(txt) {
    this.setState({
      bpm: txt == '' ? 0 : parseInt(txt)
    });
  }

  _startTimer() {
    this.setState({
      listening: true
    });
    let curStave = this.state.selectedStave + 1;
    if (this.state.selectedStave == -1) {
      curStave = 1;
      this.setState({
        selectedStave: 0
      });
    }
    const { stavesPerPage, measuresPerStave } = this.renderer.options;
    let incr = this.state.selectedPage * stavesPerPage + curStave;
    const timeHandler = () => {
      if (incr == Math.ceil(this.vexMusicContainer.stavesNumber / measuresPerStave)) {
        this._stopTimer();
      }
      else if ((this.state.selectedStave+1) % this.renderer.options.stavesPerPage == 0) {
        this._pageChanged(this.state.selectedPage + 1, true);
      }
      else {
        this.setState({
          selectedStave: this.state.selectedStave + 1
        });
      }
      ++incr;
    }
    const nmeasures = this.renderer.options.measuresPerStave;
    this.intervalId = setInterval(timeHandler,this._calculateTimeInterval()*nmeasures);
  }

  _stopTimer() {
    clearInterval(this.intervalId);
    this.setState({
      listening:  false,
      selectedStave: -1
    });
  }

  _calculateTimeInterval() {
    const pace = this.state.bpm / 60;
    const time = this.vexMusicContainer.drawables[0].time;
    const beats = parseInt(time.beats);
    const beatType = parseInt(time.beatType);
    if (beatType > 4) {
      const rem = beatType / 4;
      beats /= rem;
    }
    const measureTime = Math.ceil(beats / pace * 1000);
    return measureTime;
  }

  _startListener(){
	 MicrophoneListener.start();
  }

  _stopListener(){
	 MicrophoneListener.stop();
  }

  _start() {
    if (this.state.useTimer)
        _startTimer();
    else
        _startListener();
  }

  _stop() {
    _stopTimer();
    _stopListener();
  }

  render() {
    const indices = [];
    for (let i = 1; i <= this.state.pages;++i)
      indices.push(i);

    return (
      <View style={{flex: 1}}>
        <View style = {styles.head}>
          <Picker style={{width: 100}} selectedValue={this.state.selectedPage + 1} onValueChange={(page) => this._pageChanged(page-1)}>
            { 
              this.state.pages ?
              indices.map((num, idx) => (<Picker.Item label={num.toString()} value={num} key={idx} />)) 
              :
              <Picker.Item label='0' value='0' />
            }
          </Picker>
          <TextInput style={styles.bpmInput} placeholder='bpm' onChangeText={(txt) => this._handleInput(txt)} value={`${this.state.bpm}`}></TextInput>
        </View>
        <View>
          { this.state.staves ? this.state.staves.map((svgElement, idx) => 
            (<View style={idx == this.state.selectedStave ? styles.chosenStave : {}}>
              <TouchableOpacity onPress = {(e) => this._stavePressed(idx)}>{svgElement}</TouchableOpacity>
            </View>)) : null }
        </View>
        <View style={styles.listenButton}>
          { this.state.listening ? <Button title="Stop" onPress={() => this._stop()} />
          : <Button title="Listen" onPress={() => this._start()}/> }
        </View>
      </View>
    );
  }
}

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
  listenButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0
  }
});
