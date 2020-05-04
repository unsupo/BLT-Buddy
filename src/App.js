import React, { Component } from 'react';
import './App.css';

import syncIcon from "./sync.gif";


import Button from '@salesforce/design-system-react/components/button';
import CircularProgress from '@material-ui/core/CircularProgress';




class App extends Component {
  static displayName = 'BLT Buddy';

  constructor(props){
	  super(props);
	  this.state = {
		on : false,
		status : "idle",
		working: false
	 }
  } 
 


	componentDidMount () {
		fetch('http://'+window.location.hostname+":"+5000+'/cmd',{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({"value": "ps -ef|grep node"})
		})
			.then(resp => resp.json())	
			.then(data => {
				console.log(JSON.stringify(data));
				this.setState({data: JSON.stringify(data)})
			});
	}

	changeStatus = (status) =>{
		if(status == this.state.status){
			return;
		}
		this.setState({'status' : status});	
		console.log(this.state);
		working = true;
	}		

	render() {
		return (
			<div >
				<div style ={{padding:50, 'padding-bottom': 0}}>
					<Button variant="brand" onClick={ () => this.changeStatus('sync')} style={{height:100 , width: 200, 'font-size':50}}>Sync</Button>
					{this.state.status == "sync" && <CircularProgress style={{height:50 , width:50, position: 'relative', top : 20, left:50}} variant="indeterminate"/>}
				</div>
				<div style ={{padding:50, 'padding-bottom': 0}}>
					<Button variant="brand" onClick={ () => this.changeStatus('build')} style={{height:100 , width: 200, 'font-size':50}}>Build</Button>
					{this.state.status == "build" && <CircularProgress style={{height:50 , width:50, position: 'relative', top : 25, left:50}} variant="indeterminate"/>}
				</div>
				<div style ={{padding:50, 'padding-bottom': 0}}>
					<Button variant="brand" onClick={ () => this.changeStatus('start')} style={{height:100 , width: 200, 'font-size':50}}>Start</Button>
					{this.state.status == "start" && <CircularProgress style={{height:50 , width:50, position: 'relative', top : 25, left:50}} variant="indeterminate"/>}
				</div>
				<div style ={{padding:50, 'padding-bottom': 0}}>
					<Button variant="brand" onClick={ () => this.changeStatus('stop')} style={{height:100 , width: 200, 'font-size':50}}>Stop</Button>
					{this.state.status == "stop" && <CircularProgress style={{height:50 , width:50, position: 'relative', top : 25, left:50}} variant="indeterminate"/>}
				</div>
			</div>
		)
	};
}

export default App;
