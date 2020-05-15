import React from 'react';
import Default from "../../defaultpage/Default";
import {PageHeaderControl} from "@salesforce/design-system-react";
import PageHeader from "@salesforce/design-system-react/components/page-header";
import Icon from "@salesforce/design-system-react/components/icon";
import isElectron from "is-electron";

/*
This is where you create actions that you can use in the tray
or you can use in Timings
 */
class Monitoring extends React.Component {
    constructor(props) {
        super(props);
        this.interval = setInterval(() => this.get_app_health, 1000);
    }
    state = {
        health: '',
    };
    get_app_health(){
        if(isElectron()) {
            window.ipcRenderer.invoke('api', {'cmd': 'check-health'}).then(value => {
                this.setState({health: JSON.parse(value['res'])})
            })
        }
    }
    componentDidMount() {
        this.interval = setInterval(() => this.get_app_health, 1000);
    }
    componentWillUnmount() {
        clearInterval(this.interval);
    }
    render() {
        this.get_app_health()
        return (
            <Default title={'Monitoring'}>
                <PageHeader
                    details={[
                        {
                            label: 'Field 1',
                            content:
                                'Description that demonstrates truncation with content. Description that demonstrates truncation with content.',
                            truncate: true}
                    ]}
                    icon={
                        <Icon
                            assistiveText={{ label: 'User' }}
                            category="standard"
                            name={this.isRunning() ? "task2" : "first_non_empty"}
                        />
                    }
                    label="Status"
                    // onRenderActions={actions}
                    title={this.isRunning() ? "Running" : "Stopped"}
                    variant="record-home"
                />
            </Default>
        );
    }

    isRunning() {
        return this.state.hasOwnProperty('health');

        // return this.state.health && this.state.health['app'] && this.state.health['app']['ui_check'] === "UP";
    }
}
export default Monitoring;