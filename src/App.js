import React, {Component} from 'react';
import './App.css';
import Docs from './components/docs/Docs'
import MyAppLauncher from './components/applauncher/AppLauncher';
import IconSettings from "@salesforce/design-system-react/components/icon-settings";
import Configs from "./components/configs/Configs";
import TrayCustomizer from "./components/traycustomizer/TrayCustomizer";
import Installer from "./components/installer/Installer";

class App extends Component {
    static displayName = 'AppLauncherExample';

    constructor(props) {
        super(props);
        this.getData = this.getData.bind(this);
    }

    state = {
        search: '',
        app: 'Documentation'
    };

    onSearch = (event) => {
        this.setState({search: event.target.value});
    };
    getData(e,val){
        this.state.app = val
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
                        {'title': 'Installer', 'iconText': 'TC', 'description': 'Customize Tray', 'color': '#59a734'}
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
        }
    }
}

export default App;
