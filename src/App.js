import React, {Component} from 'react';
import './App.css';
import Docs from './components/pages/docs/Docs'
import MyAppLauncher from './components/applauncher/AppLauncher';
import IconSettings from "@salesforce/design-system-react/components/icon-settings";
import Configs from "./components/pages/configs/Configs";
import TrayCustomizer from "./components/pages/traycustomizer/TrayCustomizer";
import Installer from "./components/pages/installer/Installer";
import Actions from "./components/pages/actions/Actions";
import Timings from "./components/pages/timings/Timings";
import Monitoring from "./components/pages/monitoring/Monitoring";

class App extends Component {
    static displayName = 'App.js';

    constructor(props) {
        super(props);
        this.getData = this.getData.bind(this);
        ipcRenderer.invoke('ui').then(value => {
            if(value)
                this.setState({app: value})
        })
    })


    state = {
        search: '',
    };

    onSearch = (event) => {
        this.setState({search: event.target.value});
    };
    getData(e,val){
        this.setState({app:val})
        this.forceUpdate()
    }
    render() {
        return (
            <IconSettings iconPath="/assets/icons">
                {/*Pick the pages in the app launcher*/}
                <MyAppLauncher sendData={this.getData} apps={
                    [
                        {'title': 'Documentation', 'iconText': 'DO', 'description': 'Documentation', 'color': '#b67e6a'},
                        {'title': 'Configs', 'iconText': 'CO', 'description': 'Configurations', 'color': '#e0cf76'},
                        {'title': 'Tray Customizer', 'iconText': 'TC', 'description': 'Customize Tray', 'color': '#597ab3'},
                        {'title': 'Installer', 'iconText': 'IN', 'description': 'Install BLT with adventure and ansible', 'color': '#59a734'},
                        {'title': 'Actions', 'iconText': 'AC', 'description': 'Create Actions for tray and timings, like sync and build', 'color': '#c71717'},
                        {'title': 'Timings', 'iconText': 'TM', 'description': 'Schedule if/when actions should run like at 5am everyday', 'color': '#a78a34'},
                        {'title': 'Monitoring', 'iconText': 'MN', 'description': 'Monitor health of BLT', 'color': '#3483a7'}
                    ]}/>
                {/*Then display the picked page here*/}
                {this.getApp()}
            </IconSettings>
        )
    };

    getApp() {
        switch (this.state.app) {
            case "Documentation": return <Docs />
            case "Configs": return <Configs />
            case "Tray Customizer": return <TrayCustomizer />
            case "Installer": return <Installer />
            case "Actions": return <Actions />
            case "Timings": return <Timings />
            default: return <Monitoring />
        }
    }
}

export default App;
