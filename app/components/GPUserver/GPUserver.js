import React, {Component} from 'react';
import {AppRegistry, Text, View, Button, StyleSheet, Switch, ActivityIndicator, Image} from 'react-native';
const timer = require('react-native-timer');

export default class GPUserver extends Component {

  constructor() {
    super();
    this.state = {
      serverStatus: 'off',
      isDisabledGpuSwitch: false,
      isDisabledGpuButton: false,
      streamControllerResult: null,
      streamControllerResultColor: 'green',
    }
  }

  serverSwitchOnPress() {
    this.setState({isDisabledGpuSwitch: true});
    this.setState({isDisabledGpuButton: true});
    let ws = new WebSocket('ws://dubstreams.com:8001');
    
    ws.onopen = () => {
      if (this.state.serverStatus == 'off') {
        ws.send("serverOn");
      }
      else {
        ws.send("serverOff");
      }
    }
    ws.onmessage = (response) => {
      this.setState({isDisabledGpuSwitch: false});
      this.setState({isDisabledGpuButton: false});

      if (response.data == '1') {
        if (this.state.serverStatus == 'off') {
          this.setState({serverStatus: 'on'});
        }
        else {
          this.setState({serverStatus: 'off'});
          fetch('http://dubstreams.com/updateLiveStreamStatus', {
            method: 'POST',
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({response : 'streamOff'}),
          })
          .catch((error) => {
            console.error(error);
          });
        }
      }
      if (response.data == '-1') {
        console.log('error');
      }
    }
  }

  serverUpdateStatus() {
    this.setState({isDisabledGpuButton: true});
    this.setState({isDisabledGpuSwitch: true});
    let ws = new WebSocket('ws://dubstreams.com:8001');

    ws.onopen = () => {
      ws.send("checkServerStatus");
    }

    ws.onmessage = (response) => {
      this.setState({isDisabledGpuSwitch: false});
      this.setState({isDisabledGpuButton: false});
      if (response.data == 'on') {
        this.setState({serverStatus: 'on'});
      } else if (response.data == 'off') {
        this.setState({serverStatus: 'off'});
        fetch('http://dubstreams.com/updateLiveStreamStatus', {
          method: 'POST',
          headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          },
          body: JSON.stringify({response : 'streamOff'}),
        })
        .catch((error) => {
          console.error(error);
        });
      }
    }
  }

  printStreamControllerResult(result) {
    this.setState({streamControllerResult: result}, () => timer.setTimeout(
      this, 'hideMsg', () => this.setState({streamControllerResult: null}), 4000
    ));
  }

  startStream() {
    this.setState({isDisabledGpuButton: true});
    this.setState({isDisabledGpuSwitch: true});
    const ws = new WebSocket('ws://dubstreams.com:8001');

    ws.onopen = () => {
      ws.send("startStream");
    }
    ws.onmessage = (response) => {
      this.setState({isDisabledGpuSwitch: false});
      this.setState({isDisabledGpuButton: false});
      if (response.data == '0') {
        this.setState({streamControllerResultColor: 'green'});
        this.printStreamControllerResult('Started');
        fetch('http://dubstreams.com/updateLiveStreamStatus', {
          method: 'POST',
          headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          },
          body: JSON.stringify({response : 'streamOn'}),
        })
        .catch((error) => {
          console.error(error);
        });
      } else if (response.data == '-1') {
        this.setState({streamControllerResultColor: 'green'});
        this.printStreamControllerResult('Failed');
      }
    }
  }

  killStream() {
    this.setState({isDisabledGpuButton: true});
    this.setState({isDisabledGpuSwitch: true});
    const ws = new WebSocket('ws://dubstreams.com:8001');

    ws.onopen = () => {
      ws.send("killStream");
    }
    ws.onmessage = (response) => {
      this.setState({isDisabledGpuSwitch: false});
      this.setState({isDisabledGpuButton: false});
      if (response.data == '0') {
        this.setState({streamControllerResultColor: 'green'});
        this.printStreamControllerResult('Killed');
        fetch('http://dubstreams.com/updateLiveStreamStatus', {
          method: 'POST',
          headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          },
          body: JSON.stringify({response : 'streamOff'}),
        })
        .catch((error) => {
          console.error(error);
        });
      } else if (response.data == '-1') {
        this.setState({streamControllerResultColor: 'red'});
        this.printStreamControllerResult('Kill Stream Failed');
      }
    }
  }


  render() {
    let spinner = (this.state.isDisabledGpuButton) ? (
                    <ActivityIndicator
                    animating={true}
                    size="large"
                    />
                  ) : (
                      null
                  );
    return(
      <View>
        <View style={styles.serverStatusView}>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <Text style={styles.serverStatusTitle}>
              GPU Server is {this.state.serverStatus}
            </Text>
            <View style={styles.gpuServerSwitch}>
              <Switch
                disabled={this.state.isDisabledGpuSwitch}
                onValueChange={this.serverSwitchOnPress.bind(this)}
                value={this.state.serverStatus == 'on' ? true : false}
              />
            </View>
          </View>
        </View>
        <View style={{flex: 1, flexDirection: 'row'}}>
          <View style={styles.gpuButton}>
            <Button
              disabled={this.state.isDisabledGpuButton}
              onPress={this.serverUpdateStatus.bind(this)}
              title={'Update Status'} 
            />
          </View>
          <View style={styles.activity}>
            {spinner}
          </View>
        </View>
      {this.state.serverStatus == 'on' && 
        <View style={styles.streamControls}>
          <View style={styles.gpuButton}>
            <Button
                  disabled={this.state.isDisabledGpuButton}
                  onPress={this.startStream.bind(this)}
                  title={'Start Stream'} 
                  color={'green'}
                />
          </View>
          <View style={styles.gpuButton}>
            <Button
                  disabled={this.state.isDisabledGpuButton}
                  onPress={this.killStream.bind(this)}
                  title={'Kill Stream'}
                  color={'red'}
                />
          </View>
          <View>
            <Text 
              style={{
                color: this.state.streamControllerResultColor, 
                marginLeft: 8,
                marginTop: 10,
              }}>
              {this.state.streamControllerResult}
            </Text>
          </View>
        </View>
      }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  serverStatusView: {
    marginLeft: 10,
    marginTop: 20,
    marginBottom: 50,
  },
  serverStatusTitle: {
    height: 100,
    fontSize: 30
  },
  gpuServerSwitch: {
    marginLeft: 20,
    marginTop: 10
  },
  gpuButton: {
    width: 130,
    height: 60,
    marginLeft: 10,
  },
  activity: {
    marginLeft: 20,
    marginTop: 16,
  },
  streamControls: {
    flex: 1, 
    flexDirection: 'row', 
    marginTop: 50,
    marginBottom: -50
  },
});

AppRegistry.registerComponent('GPUserver', () => GPUserver);