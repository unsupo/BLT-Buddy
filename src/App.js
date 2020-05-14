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
import isElectron from "is-electron";
import AlertContainer from "@salesforce/design-system-react/components/alert/container";
import Alert from "@salesforce/design-system-react/components/alert";
import Icon from "@salesforce/design-system-react/components/icon";

class App extends Component {
    static displayName = 'App.js';

    constructor(props) {
        super(props);
        this.getData = this.getData.bind(this);
        if(isElectron())
            window.ipcRenderer.invoke('ui',{key: 'constructor'}).then(value => {
                if(value) {
                    this.setState({app: value.app})
                    if(Object.values(value).indexOf('details') > -1 && value.details === 'not installed')
                        this.setState({alert: 'blt not installed'})
                }
            })
    }


    state = {
        search: '',
    };
    displayAlert() {
        if(this.state.alert)
            return (<AlertContainer>
                <Alert
                    icon={<Icon category="utility" name="error" />}
                    labels={{
                        heading:
                            'BLT is not installed, please use the ',
                        headingLink: 'installer',
                    }}
                    onClickHeadingLink={() => {
                        this.getData(undefined,'Installer')
                    }}
                    variant="error"
                />
            </AlertContainer>);
        return undefined
    }
    getData(e,val){
        this.setState({app:val})
        this.forceUpdate()
        if(isElectron())
            window.ipcRenderer.invoke('ui',{key: 'changepage',app: val})
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
                {this.displayAlert()}
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
