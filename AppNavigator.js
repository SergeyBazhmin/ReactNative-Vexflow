import {createStackNavigator} from 'react-navigation';
import HomeScreen from './screens/HomeScreen';
import ScoreScreen from './screens/ScoreScreen';

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