import React, {Component} from 'react';
import {AppRegistry, Text, View} from 'react-native';

import GPUserver from './app/components/GPUserver/GPUserver'
import MovieControl from './app/components/MovieControl/MovieControl'
import QueueList from './app/components/QueueList/QueueList'

export default class streamController extends Component {
  render() {
    return(
      <View>
        <GPUserver />
        <MovieControl />
      </View>
    );
  }
}

AppRegistry.registerComponent('streamController', () => streamController);