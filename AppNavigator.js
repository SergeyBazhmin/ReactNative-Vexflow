import {createStackNavigator} from 'react-navigation';
import HomeScreen from './HomeScreen';
import ScoreScreen from './ScoreScreen';

export default AppNavigator = createStackNavigator({
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
);