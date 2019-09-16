import React from 'react';
import {
  View,
  Platform,
  BackHandler,
  Dimensions,
  Keyboard,
  Button,
} from 'react-native';
import {WebView} from 'react-native-webview';
import PushNotification from 'react-native-push-notification';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleHeight: Dimensions.get('window').height,
    };
  }

  webView = {
    canGoBack: false,
    ref: null,
    source: 'https://qatros.com',
  };

  onAndroidBackPress = () => {
    if (this.webView.canGoBack && this.webView.ref) {
      this.webView.ref.goBack();
      return true;
    }
    return false;
  };

  componentDidMount() {
    if (Platform.OS === 'android') {
      BackHandler.addEventListener(
        'hardwareBackPress',
        this.onAndroidBackPress,
      );
      Keyboard.addListener('keyboardDidShow', this.keyboardDidShow.bind(this));
      Keyboard.addListener('keyboardDidHide', this.keyboardDidHide.bind(this));
    }
  }

  keyboardDidShow(e) {
    let newSize = Dimensions.get('window').height - e.endCoordinates.height;
    this.setState({visibleHeight: newSize});
  }

  keyboardDidHide(e) {
    this.setState({visibleHeight: Dimensions.get('window').height});
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      BackHandler.removeEventListener('hardwareBackPress');
    }
  }

  sendNotif(json) {
    data = JSON.parse(json);
    message = data.body.replace(/<[^>]*>/g, '');

    PushNotification.localNotification({
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_launcher',
      bigText: message,
      vibrate: true,
      vibration: 300,
      title: 'Pesan dari ' + data.author_id[1],
      message: message.substr(0, 40) + '...',
      playSound: true,
      soundName: 'default',
    });
  }

  render() {
    const injectedJS = 'this.odoo.in_app = true';

    return (
      <View style={{height: this.state.visibleHeight}}>
        <WebView
          source={{uri: this.webView.source}}
          ref={webView => {
            this.webView.ref = webView;
          }}
          onNavigationStateChange={navState => {
            this.webView.canGoBack = navState.canGoBack;
          }}
          incognito={true}
          onMessage={event => {
            this.sendNotif(event.nativeEvent.data);
          }}
          injectedJavaScript={injectedJS}
        />
      </View>
    );
  }
}
