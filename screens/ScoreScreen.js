import React from 'react';
import { View, Button, Picker, ToastAndroid, TouchableOpacity, StyleSheet, Text, DeviceEventEmitter} from 'react-native';
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
                <MenuItem onPress={navigation.getParam('_setTimerMode')}>Timer</MenuItem>
                <MenuItem onPress={navigation.getParam('_setListeningMode')}>Listen</MenuItem>
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
      listening: false,
      useTimer: true,
    };

    this._showMenu = this._showMenu.bind(this);
    this._setMenuRef = this._setMenuRef.bind(this);
    this._setListeningMode = this._setListeningMode.bind(this);
    this._setTimerMode = this._setTimerMode.bind(this);


    DeviceEventEmitter.addListener('onNewSoundData', (e)=>{ this.onNewSoundData(e);});
    DeviceEventEmitter.addListener('onTactChanged', (e)=>{ this.onTactChanged(e);});
  }

  onNewSoundData(e){
	  MusicPosition.onNewSoundData(e)
  }

  onTactChanged(e){
    ToastAndroid.show('Tact  ' + e, ToastAndroid.LONG);
    if (e + 1 == this.vexMusicContainer.stavesNumber * this.renderer.options.measuresPerStave) {
        this._stop();
    }

    if (e % (this.renderer.options.stavesPerPage * this.renderer.options.measuresPerStave) == 0) {
        this._pageChanged(this.state.selectedPage + 1, true);
    }
    else if (e % this.renderer.options.measuresPerStave == 0){
      let stave = e / this.renderer.options.measuresPerStave;
      stave = stave - this.state.selectedPage * this.renderer.options.stavesPerPage;
      this.setState({
        selectedStave: stave
      });
    }
  }

  componentDidMount() {
    this.props.navigation.setParams({
      _setMenuRef: this._setMenuRef,
      _showMenu: this._showMenu,
      _setListeningMode: this._setListeningMode,
      _setTimerMode: this._setTimerMode
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
      let notes = this.vexMusicContainer.allNotes;

      let measures = this.vexMusicContainer.allNotes; //new property
      notes = measures.map(m => m.map(note => note.keys.map(key => key.split('/')[0]))); //array of note characters
      MusicPosition.init(notes)
      this.setState({
        pages: this.vexMusicContainer.drawables[len-1].page+1
      });
    })
    .catch(reason => {
      ToastAndroid.show(reason.message, ToastAndroid.SHORT);
    });

    MicrophoneListener.setBufferSize((2048 + 16)*2);
  }

  _setMenuRef(ref) {
    this._menu = ref;
  }

  _setTimerMode() {
    ToastAndroid.show('Timer', ToastAndroid.SHORT);
    this.setState({
      useTimer: true
    });
    this._menu.hide();
  }

  _setListeningMode() {
    ToastAndroid.show('Listening', ToastAndroid.SHORT);
    this.setState({
      useTimer: false
    });
    this._menu.hide();
  }

  _showMenu() {
    this._menu.show();
  }

  _pageChanged(page, selectFirst=false) {
    if (!selectFirst)
        this._updateMusicPosition(page, 0);
    this.setState({
      selectedPage: page,
      selectedStave: selectFirst ? 0 : -1,
      staves: this.renderer.render(this.vexMusicContainer.getMeasuresOnPage(page))
    });
  }

  _updateMusicPosition(page, stave) {
    const { stavesPerPage, measuresPerStave } = this.renderer.options;
    MusicPosition.setCurrentTact(page * stavesPerPage * measuresPerStave + stave * measuresPerStave);
  }

  _stavePressed(id) {
    this._updateMusicPosition(this.state.selectedPage, this.state.selectedStave === id ? 0 : id);
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
    const { stavesPerPage, measuresPerStave } = this.renderer.options;
    let curStave = this.state.selectedStave === -1 ? 1 : (this.state.selectedStave + 1);

    let incr = this.state.selectedPage * stavesPerPage + curStave;
    const timeHandler = () => {
      if (incr == Math.ceil(this.vexMusicContainer.stavesNumber / measuresPerStave)) {
        this._stop();
      }
      else if ((this.state.selectedStave+1) % this.renderer.options.stavesPerPage === 0) {
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
    this.setState({
      listening: true,
      selectedStave: this.state.selectedStave === -1 ? 0 : this.state.selectedStave
    }, () => {
      if (this.state.useTimer)
        this._startTimer();
      else
        this._startListener();
    });
  }

  _stop() {
    if (this.state.useTimer)
      this._stopTimer();
    else
      this._stopListener();
    this.setState({
      listening:  false,
      selectedStave: -1
    });
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
