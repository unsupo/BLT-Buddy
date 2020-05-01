import React, { Component } from 'react';
import './App.css';


import Tabs from '@salesforce/design-system-react/components/tabs';
import TabsPanel from '@salesforce/design-system-react/components/tabs/panel';



class App extends Component {
  static displayName = 'AppLauncherExample';

	state = {
		search: '',
	};


	componentDidMount () {
		fetch(window.location.origin+":"+5000+'/cmd',{
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

	onSearch = (event) => {
		this.setState({ search: event.target.value });
	};

	render() {
		return (<Tabs id="tabs-example-default">
			<TabsPanel label="Item One">{this.state.data}</TabsPanel>
			<TabsPanel label="Item Two">Item Two Content</TabsPanel>
			<TabsPanel label="Item Three">Item Three Content</TabsPanel>
			<TabsPanel disabled label="Disabled">
				Disabled Content
			</TabsPanel>
		</Tabs>)
	};
}

export default App;
