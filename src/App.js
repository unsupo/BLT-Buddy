import React, {Component} from 'react';
import './App.css';

import BrandBand from '@salesforce/design-system-react/components/brand-band';

import Tabs from '@salesforce/design-system-react/components/tabs';
import TabsPanel from '@salesforce/design-system-react/components/tabs/panel';
import Constant from "./constant";
import {Button} from "@salesforce/design-system-react";
import MyAppLauncher from './AppLauncher';
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
                <MyAppLauncher/>
                <BrandBand
                    id="brand-band-lightning-blue"
                    size="large"
                    backgroundSize="cover"
                    className="slds-p-around_large">
                    <div className="slds-box slds-theme_default">
                        <h3 className="slds-text-heading_label slds-truncate">Docs</h3>
                    </div>
                </BrandBand>
            </IconSettings>
        )
    };
}

export default App;
