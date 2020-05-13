import React, {Component} from 'react';
import './App.css';
import Docs from './components/docs/Docs'
import MyAppLauncher from './components/applauncher/AppLauncher';
import IconSettings from "@salesforce/design-system-react/components/icon-settings";

class App extends Component {
    static displayName = 'AppLauncherExample';

    state = {
        search: '',
    };


    componentDidMount() {
        fetch('http://localhost' + ":" + 5000 + '/cmd', {
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
        this.setState({search: event.target.value});
    };

    render() {
        return (
            <IconSettings iconPath="/assets/icons">
                <MyAppLauncher apps={
                    [
                        {'title': 'Documentation', 'iconText': 'DO', 'description': 'Documentation', 'color': '#b67e6a', 'comp': Docs},
                        {'title': 'Configs', 'iconText': 'CO', 'description': 'Configurations', 'color': '#e0cf76','comp': undefined}
                    ]}/>
            </IconSettings>
        )
    };
}

export default App;
