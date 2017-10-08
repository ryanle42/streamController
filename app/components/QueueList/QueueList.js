import React, {Component} from 'react';
import {AppRegistry, Text, View, StyleSheet, Button, Picker} from 'react-native';

export default class QueueList extends Component {
	constructor() {
    super();
    this.state = {
      queue: [],
    }
    this.getQueue();
  }

  getQueue() {
    fetch('http://76.103.77.177/getQueue', {
      method: 'POST',
      headers: {},
    })
    .then(response => {
      data = JSON.parse(response._bodyText);
      this.setState({queue: data});
    });
  }
  
  render() {
	 return(
    <View 
      style={{
        marginTop: 30,
        marginLeft: 10,
      }}>
      <View>
        <Text style={styles.title}>
          Queue
        </Text>
      </View>
      <View>
        {
          this.state.queue.map(movie => <Text>{movie['month']}/{movie['day']} {movie['hour']}:{movie['minute']} {movie['name']}</Text>)
        }
      </View>
    </View>
   );
	}
}
const styles = StyleSheet.create({
  title: {
    fontSize: 20,
  }
});
AppRegistry.registerComponent('QueueList', () => QueueList);
