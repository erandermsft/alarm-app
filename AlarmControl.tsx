import React from 'react';

import { StyleSheet, Text, View, Button,TextInput, ColorPropType, Alert } from 'react-native';
 
  type ControlMessage = {
    msg: string
  }

  type ControlState = { endpoint: string,
                  connected:boolean,
                   connectionState: string,
                   lastMessage:string
                   alarmTriggered:boolean,
                   alarmStats : {
                    
                     now: number,
                     enqueued: number,
                     elapsed:number,
                     
                   }
                  };

  class AlarmControl extends React.Component<{},ControlState> {
      connection: WebSocket; 
  
    constructor(props) {
      super(props);
      this.state={
        endpoint:"",
        connected: false,
        connectionState:"Disconnected",
        lastMessage: "",
        alarmTriggered : false,
        alarmStats :{
            now: Date.now(),
            enqueued: null,
            elapsed: null
           
        },
       }
    }
    
    componentDidMount(){
    }
    disconnectButtonPressed(){
      this.sendControlMessage("agent disconnecting");
      this.setState({connected:false,connectionState : "Disconnected"});
      this.connection.close();
    }
    connectButtonPressed(){
      if(!this.connectionStringValid()){
        Alert.alert("Invalid connection string",
        "Connection string must start with ws:// or wss://",
        [
          {text:"OK", onPress:() => console.log("OK Pressed")}
        ]
        );
      }
      else{
      this.setState({connectionState : "Connecting to "+this.state.endpoint});
        this.connection = new WebSocket(this.state.endpoint);
        this.connection.onopen = () =>{ 
            //send any msg from Client if needed
            this.sendControlMessage("agent connected");
            this.setState({connected:true,connectionState : "Connected to " +this.state.endpoint});
        }
        this.connection.onerror = (err) => {
          this.setState({connectionState : "Error" +err}); 
        }
        // listen to onmessage event
        this.connection.onmessage = evt => { 
            //Assume an alarm
          var msg = JSON.parse(evt.data)

          if (!msg.hasOwnProperty('deviceId')){  
            this.setState({lastMessage : evt.data});
          }
          else if(!this.state.alarmTriggered){
            let elapsed = Date.now() - msg.generated;
            this.sendControlMessage("alarm received");
      
            this.setState({lastMessage : evt.data,
                            alarmTriggered:true});
            this.setState({alarmStats : {
                  now:Date.now(),
                  enqueued:msg.generated,
                  elapsed:msg.processing
            }});
        }
      }
    }
    }
    sendControlMessage(message:string){
      var ctrlMessage:ControlMessage = {msg:message};
      this.connection.send(JSON.stringify(ctrlMessage));
    }
    renderAlarmButton(){
      if(this.state.alarmTriggered && this.state.connected){
        return(
        <View>
          <Text>Alarm triggered</Text>
          <Button title="Reset Alarm" onPress={this.alarmResetButtonPressed.bind(this)} ></Button>
          <Text >
              Elapsed:{this.state.alarmStats.elapsed}
          </Text>
        </View>
        );
      }
      return null;
    }
    alarmResetButtonPressed(){
      this.sendControlMessage("alarm cleared");
      this.setState({connectionState : "Alarm Reset",
                      alarmTriggered:false});
    }
    connectionStringValid():boolean{
      return(this.state.endpoint != null && (this.state.endpoint.startsWith("ws://") || this.state.endpoint.startsWith("wss://")));
    }
      render() {
      return ( 
          <View style={styles.container}>
              <View style={styles.headerContainer}></View>
              <View style={styles.configurationContainer}>
                  <Text style={styles.formLabel}>Server name</Text>
                  <TextInput placeholder="ws://" multiline = {true} numberOfLines = {2} style={styles.formField} defaultValue={this.state.endpoint} onChangeText={(connString) => this.setState({ endpoint:connString == null ? connString : connString.toLowerCase() })}/>
                  <View style={styles.buttonContainer} >
                    <View>
                      <Button title="Connect" onPress={this.connectButtonPressed.bind(this)} disabled={this.state.connected} ></Button>
                    </View>
                    <View> 
                      <Button title="Disconnect" onPress={this.disconnectButtonPressed.bind(this)} disabled={!this.state.connected} ></Button>
                    </View>
                  </View>
              </View>
              <View style={styles.statusContainer}>
                  <Text style={styles.formLabel}>Status:</Text><Text>{this.state.connectionState}</Text>
                  <Text style={styles.formLabel}>Last message received:</Text>
                  <Text>{this.state.lastMessage}</Text>  
              </View>
              <View style={styles.alarmContainer}>
                { this.renderAlarmButton()       }       
              </View>
           </View>
      );
    }
  } 
 
  export default AlarmControl;
  const styles = StyleSheet.create({
    buttonStyle:{
      width:100
    },
    headerContainer:{
      flex:1
    },
    buttonContainer:{
      flexDirection:"row",
      alignItems:"stretch", 
      alignSelf:"center"
    },
    alarmContainer :{
      flex:6,
      alignSelf:"stretch",
    },
    configurationContainer :{
      flex:1.5,
      alignSelf:"stretch",
    },
    statusContainer:{
      flex:1,
      alignSelf:"stretch",
    },
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf:"stretch",
      paddingLeft:20,
      paddingRight:20
    },
    errorText:{
      color:"red"
    },
    hidden:{
      display:'none'
    },
    formLabel:{
      fontWeight:"bold"
    },
    formField :{
        marginTop:10,
        marginBottom:10,
        marginRight:10,
        borderColor: "black",
        borderWidth:1,
        alignSelf:"stretch"
        
    }
    
  });

