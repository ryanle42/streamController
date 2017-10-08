import React, { Component } from 'react';
import { 
  AppRegistry, 
  Text, 
  View, 
  StyleSheet, 
  Button, 
  Picker, 
  ScrollView, 
  TouchableHighlight 
} from 'react-native';
import { Dropdown } from 'react-native-material-dropdown';
import { MaterialDialog, SinglePickerMaterialDialog } from 'react-native-material-dialog';


const timer = require('react-native-timer');

export default class MovieControl extends Component {
  constructor() {
    super();
    this.state = {
      movieData: ['Empty'],
      movie: [],
      minute: '30',
      queueAddResult: null,
      queueAddResultColor: 'green',
      isDisabledAddToQueue: false,
      queue: [],
      modalVisible: false,
      isPlayAfterPickerVisible: false,
      removeFromQueueDialogVisible: false,
      clearQueueDialogVisible: false,
    }
    this.getMovieList();
    this.getQueue();
  };

  componentDidMount() {
    this.resetCurrentDate();
  }

  resetCurrentDate() {
    var date = new Date();
    let hour = date.getHours();
    let ampm;
    if (hour < 12) {
      if (hour == 0) {
        hour = 12;
      }
      ampm = 'am';
    } else {
      ampm = 'pm';
      if (hour != 12) {
        hour -= 12;
      }
    }

    this.setState({'month' : (date.getMonth() + 1).toString()});
    this.setState({'day' : date.getDate().toString()});
    this.setState({'hour' : hour.toString()});
    this.setState({'ampm' : ampm});
  }

  refreshLists() {
    this.getMovieList();
    this.getQueue();
    this.resetCurrentDate();
  }

  convertDate(month, day, hour, minute) {
    let date = new Date(2017, month - 1, day, hour, minute, 0);
    let utcDate = new Date(date.toUTCString());
    return (Math.floor(utcDate.getTime()/1000));
  };

  getMovieList() {
    fetch('http://dubstreams.com/getMovieList', {
      method: 'POST',
    })
    .then(response => {
      data = JSON.parse(response._bodyText);
      let movies = [];
      for (movie in data) {
        movies.push(movie);
      };
      movies.sort();
      this.setState({movieData: movies});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  playNow() {
    let json = {};

    json['start'] = Math.floor((new Date).getTime()/1000);
    json['name'] = this.state.movie;

    fetch('http://dubstreams.com/addMovieToQueue', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(json),
    })
    .then(response => {
      data = response._bodyText;
      if (data == 'ok') {
        this.printQueueAddResult('Playing', 'green');
      } else if (data == 'conflict') {
        this.printQueueAddResult('Conflict', 'red');
      } else {
        this.printQueueAddResult('???', 'black');
      }
      this.getQueue()
    })
    .catch((error) => {
      console.error(error);
    });
  }

  callPlayAfterPicker() {
    this.setState({isPlayAfterPickerVisible: true});
  }
  
  callRemoveFromQueueDialog() {
    this.setState({removeFromQueueDialogVisible: true});
  }

  callClearQueueDialog() {
    this.setState({clearQueueDialogVisible: true});
  }

  addToQueue(start) {
    let json = {};
    
    let month = parseInt(this.state.month);
    let day = parseInt(this.state.day);
    let hour = parseInt(this.state.hour);
    let minute = parseInt(this.state.minute);

    if (this.state.ampm == 'pm') {
      if (hour != 12) {
        hour += 12
      }
    } else if (hour == 12) {
      hour = 0;
    }

    if (isNaN(start)) {
      start = this.convertDate(month, day, hour, minute);
    }
    
    json['start'] = start.toString();
    json['name'] = this.state.movie;
    console.log(json);
    fetch('http://dubstreams.com/addMovieToQueue', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(json),
    })
    .then(response => {
      data = response._bodyText;
      if (data == 'ok') {
        this.printQueueAddResult('Added!', 'green');
      } else if (data == 'conflict') {
        this.printQueueAddResult('Conflict', 'red');
      } else {
        this.printQueueAddResult('???', 'black');
      }
      this.getQueue()
    })
    .catch((error) => {
      console.error(error);
    });
  }
  
  removeFromQueue(start) {
    json = {};
    json['start'] = start;

    fetch('http://dubstreams.com/removeFromQueue', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(json),
    })
    .then(response => {
      this.getQueue();
    })
    .catch((error) => {
      console.error(error);
    });
  }

  getQueue() {
    fetch('http://dubstreams.com/getQueue', {
      method: 'POST',
      headers: {},
    })
    .then(response => {
      data = JSON.parse(response._bodyText);
      for (i = 0; i < data.length; i++) {
        data[i]["month"] = (new Date(data[i]["start"] * 1000).getMonth() + 1).toString();
        data[i]["day"] = new Date(data[i]["start"] * 1000).getDate().toString();
        data[i]["hour"] = new Date(data[i]["start"] * 1000).getHours();
        data[i]["minute"] = new Date(data[i]["start"] * 1000).getMinutes().toString();
        if (data[i]["minute"].length < 2) {
          data[i]["minute"] = "0" + data[i]["minute"];
        }
        if (data[i]["hour"] < 12) {
          data[i]["ampm"] = "am";
          if (data[i]["hour"] == 0) {
            data[i]["hour"] = 12;
          }
          data[i]["hour"] = data[i]["hour"].toString();
        } else {
          data[i]["ampm"] = "pm";
          if (data[i]["hour"] != 12) {
            data[i]["hour"] = data[i]["hour"] - 12;
          }
          data[i]["hour"] = data[i]["hour"].toString();
        }
      }
      this.setState({queue: data});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  clearQueue() {
    fetch('http://dubstreams.com/clearQueue', {
      method: 'POST',
      headers: {},
    })
    .then(response => {
      this.refreshLists();
    })
    .catch((error) => {
      console.error(error);
    });
  }

  printQueueAddResult(result, color) {
    this.setState({isDisabledAddToQueue: true});
    this.setState({queueAddResultColor: color});
    this.setState({queueAddResult: result}, () => timer.setTimeout(
      this, 'hideMsg', () => {
        this.setState({queueAddResult: null});
        this.setState({isDisabledAddToQueue: false});
      }, 700
    ));
  }

  render() {
    return(
      <View style={{
        marginTop: 110, 
        marginLeft: 10
      }}>
        <SinglePickerMaterialDialog
          title={'Play After'}
          items={this.state.queue.map((row, index) => ({ 
            key: index, 
            label: row['month'] + '/' + row['day'] + ' ' +  row['hour'] + ':' + row['minute'] + row['ampm'] + ' ' + row['name'], 
            value: row['end'] }))}
          visible={this.state.isPlayAfterPickerVisible}
          scrolled={true}
          selectedItem={this.state.singlePickerSelectedItem}
          onCancel={() => this.setState({ isPlayAfterPickerVisible: false })}
          onOk={(result) => {
            this.setState({ isPlayAfterPickerVisible: false });
            this.addToQueue(result['selectedItem']['value']);
        }} />
        <SinglePickerMaterialDialog
          title={'Play After'}
          items={this.state.queue.map((row, index) => ({ 
            key: index, 
            label: row['month'] + '/' + row['day'] + ' ' +  row['hour'] + ':' + row['minute'] + row['ampm'] + ' ' + row['name'], 
            value: row['start'] }))}
          visible={this.state.removeFromQueueDialogVisible}
          scrolled={true}
          selectedItem={this.state.singlePickerSelectedItem}
          onCancel={() => this.setState({ removeFromQueueDialogVisible: false })}
          onOk={(result) => {
            this.setState({ removeFromQueueDialogVisible: false });
            this.removeFromQueue(result['selectedItem']['value']);
        }} />
        <MaterialDialog
          title={"Clear Queue"}
          visible={this.state.clearQueueDialogVisible}
          onOk={() => {
            this.clearQueue();
            this.setState({clearQueueDialogVisible: false});
          }}
          onCancel={() => {
            this.setState({clearQueueDialogVisible: false});
          }}>
          <Text style={styles.dialogText}>
            Are you sure?
          </Text>
        </MaterialDialog>
        <View style= {{
          width: 330,
        }}>
          <Picker
            mode='dropdown'
            prompt='Movie'
            selectedValue={this.state.movie}
            onValueChange={(itemValue, itemIndex) => this.setState({movie: itemValue})}
          >
            {
              this.state.movieData.map(item => <Picker.Item label={item} value={item} key={'movie: ' + item} />)
            }
          </Picker>
        </View>
        <View style={{
          marginTop: 10,
          flexDirection: 'row',
          width: 235,
        }}>
          <View style= {{
            flex: 1,
            marginTop: -15,
            width: 20,
          }}>
            <Picker
              mode='dropdown'
              prompt='Month'
              selectedValue={this.state.month}
              onValueChange={(itemValue, itemIndex) => this.setState({month: itemValue})}
            >
              {
                monthData.map(item => <Picker.Item label={item} value={item} key={'month: ' + item} />)
              }
            </Picker>
          </View>
         <View style= {{
            flex: 1,
            marginTop: -15,
            marginLeft: 0,
            width: 20,
          }}>
            <Picker
              mode='dropdown'
              prompt='Day'
              selectedValue={this.state.day}
              onValueChange={(itemValue, itemIndex) => this.setState({day: itemValue})}
            >
              {
                dayData.map(item => <Picker.Item label={item} value={item} key={'day: ' + item} />)
              }
            </Picker>
          </View>
        </View>
        <View style={{
          marginTop: -10,
          marginBottom: 10,
          marginLeft: 0,
          flexDirection: 'row',
        }}>
          <View style= {{
            flex: 1,
            width: 20,
          }}>
            <Picker
              mode='dropdown'
              prompt='Hour'
              selectedValue={this.state.hour}
              onValueChange={(itemValue, itemIndex) => this.setState({hour: itemValue})}
            >
              {
                hourData.map(
                  item => <Picker.Item label={item} value={item} key={'hour: ' + item} />)
              }
            </Picker> 
          </View>
          <View style= {{
            flex: 1,
            marginLeft: 0,
            width: 20,
          }}>
            <Picker
              mode='dropdown'
              selectedValue={this.state.minute}
              onValueChange={(itemValue, itemIndex) => this.setState({minute: itemValue})}
            >
              {
                minuteData.map(item => <Picker.Item label={item} value={item} key={'minute: ' + item} />)
              }
            </Picker> 
          </View>
          <View style= {{
            flex: 1,
            marginLeft: 0,
            width: 20,          
          }}>
            <Picker
              mode='dropdown'
              prompt='ampm'
              selectedValue={this.state.ampm}
              onValueChange={(itemValue, itemIndex) => this.setState({ampm: itemValue})}
            >
              <Picker.Item label={'am'} value={'am'} key={'am'} />
              <Picker.Item label={'pm'} value={'pm'} key={'pm'} />
            </Picker> 
          </View>
        </View>
        <View style={{
          flexDirection: 'row', 
          width: 800
        }}>
          <View style={{
            width: 86,
            marginTop: 3,
            marginLeft: 0,
            marginBottom: -25,
          }}>
            <Button
              color={'green'}
              onPress={this.playNow.bind(this)}
              disabled={this.state.isDisabledAddToQueue}
              title={'Play Now'} 
            />
          </View>
          <View style={{
            width: 98,
            marginTop: 3,
            marginLeft: 10,
          }}>
            <Button
              onPress={this.callPlayAfterPicker.bind(this)}
              disabled={this.state.isDisabledAddToQueue
                || this.state.queue.length == 0}
              title={'Play After'} 
            />
          </View>
          <View style={{
            width: 120,
            marginTop: 3,
            marginLeft: 10,
          }}>
            <Button
              onPress={this.addToQueue.bind(this)}
              disabled={this.state.isDisabledAddToQueue}
              title={'Add To Queue'} 
            />
          </View>
        </View>
        <View style={{
            marginLeft: 255,
            marginTop: 3,
            marginBottom: -9,
          }}>
          <Text style={{
              color: this.state.queueAddResultColor, 
              fontSize: 15,
          }}>
              {this.state.queueAddResult == null ? ' ' : this.state.queueAddResult}
          </Text>
        </View>
        <View 
          style={{
            marginLeft: 10,
          }}>
          <View>
            <Text style={{
              fontSize: 20,
              marginBottom: 5,
            }}>
              Queue
            </Text>
          </View>
          <ScrollView style={{
            height: 160
          }}>
            {
              this.state.queue.map((movie, i) => <Text key={i}>{movie['month']}/{movie['day']} {movie['hour']}:{movie['minute']}{movie['ampm']} {movie['name']}</Text>)
            }
          </ScrollView>
        </View>
        <View style={{
          flexDirection: 'row', 
          width: 150,
          marginBottom: 10,
        }}>
          <View style={{
            width: 80,
          }}>
            <Button
              onPress={this.refreshLists.bind(this)}
              title={'Refresh'} 
            />
          </View>
          <View style={{
              width: 80,
              marginLeft: 10,
            }}>
              <Button
                color={'red'}
                onPress={this.callRemoveFromQueueDialog.bind(this)}
                disabled={this.state.isDisabledAddToQueue}
                title={'Remove'} 
              />
          </View>
          <View style={{
              width: 110,
              marginLeft: 20,
            }}>
              <Button
                color={'red'}
                onPress={this.callClearQueueDialog.bind(this)}
                disabled={this.state.isDisabledAddToQueue}
                title={'Clear Queue'} 
              />
          </View>
        </View>
      </View>
    );
  }
  
}

const styles = StyleSheet.create({
  movieName: {
    fontSize: 20,
  }
});

const monthData = [];
for (i = 1; i <= 12; i++) {
  monthData.push(i.toString());
};

const dayData = [];
daysInMonth = new Date(2017, (new Date).getMonth() + 1, 0).getDate();
console.log(daysInMonth);
for (i = 1; i <= daysInMonth; i++) {
  dayData.push(i.toString());
};

const hourData = [];
for (i = 1; i <= 12; i++) {
  hourData.push(i.toString());
};

const minuteData = [];
for (i = 0; i <= 45; i += 15) {
  minuteData.push(i.toString());
}

AppRegistry.registerComponent('MovieControl', () => MovieControl);