import React from 'react';
import Default from "../../defaultpage/Default";
import {PageHeaderControl} from "@salesforce/design-system-react";
import PageHeader from "@salesforce/design-system-react/components/page-header";
import Icon from "@salesforce/design-system-react/components/icon";
import isElectron from "is-electron";
import DataTable from "@salesforce/design-system-react/components/data-table";
import DataTableColumn from "@salesforce/design-system-react/components/data-table/column";
import DataTableCell from "@salesforce/design-system-react/components/data-table/cell";

/*
This is where you create actions that you can use in the tray
or you can use in Timings
 */

const IconDataTableCell = ({ children, ...props }) => (
    <DataTableCell title={children} {...props}>
        <Icon
            assistiveText={{ label: 'User' }}
            category="standard"
            name={console.log(children,props) ? "task2" : ""}
        />
    </DataTableCell>
);

class Monitoring extends React.Component {
    constructor(props) {
        super(props);
    }
    state = {
        health: '',
    };
    get_app_health(){
        if(isElectron()) {
            window.ipcRenderer.invoke('api', {'cmd': 'check-health'}).then(value => {
                const res = JSON.parse(value['res'])
                this.setState({health: res})
                const items = []
                for (let [key, value] of Object.entries(res['app']))
                    items.push({name: key, status: value})

                this.setState({items: items})
            })
        }
    }
    componentDidMount() {
        this.interval = setInterval(() => this.get_app_health(), 1000);
    }
    componentWillUnmount() {
        clearInterval(this.interval);
    }
    render() {
        return (
            <Default title={'Monitoring'}>
                <PageHeader
                    icon={
                        <Icon
                            assistiveText={{ label: 'User' }}
                            category="standard"
                            name={this.isRunning() ? "task2" : "first_non_empty"}
                        />
                    }
                    label="App Status"
                    // onRenderActions={actions}
                    title={this.isRunning() ? "Running" : "Stopped"}
                    variant="record-home"
                />
                <DataTable items={this.state.items}
                           id="DataTableExample-1-default"
                           fixedHeader
                           fixedLayout
                           joined>
                    <DataTableColumn key="name" label="Name" property="name" />
                    <DataTableColumn key="status" label="Status" property="status" >
                        <IconDataTableCell />
                    </DataTableColumn>
                </DataTable>
            </Default>
        );
    }

    isRunning() {
        return this.state.hasOwnProperty('health')
            && this.state.health.hasOwnProperty('app')
            && this.state.health['app'].hasOwnProperty('ui_check')
            && this.state.health['app']['ui_check'] === "UP";

        // return this.state.health && this.state.health['app'] && this.state.health['app']['ui_check'] === "UP";
    }
}
export default Monitoring;