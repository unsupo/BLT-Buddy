import React from 'react';
// const {ipcRenderer, shell} = require('electron')

import ipcRenderer from 'electron'
import AppLauncher from '@salesforce/design-system-react/components/app-launcher';
import AppLauncherLink from '@salesforce/design-system-react/components/app-launcher/link';
import AppLauncherTile from '@salesforce/design-system-react/components/app-launcher/tile';
import AppLauncherExpandableSection from '@salesforce/design-system-react/components/app-launcher/expandable-section';

import GlobalNavigationBar from '@salesforce/design-system-react/components/global-navigation-bar';
import GlobalNavigationBarRegion from '@salesforce/design-system-react/components/global-navigation-bar/region';

import Button from '@salesforce/design-system-react/components/button';
import Search from '@salesforce/design-system-react/components/input/search';
import IconSettings from '@salesforce/design-system-react/components/icon-settings';

class MyAppLauncher extends React.Component {
    static displayName = 'BLT Buddy';


    constructor(props, context) {
        super(props, context);
        ipcRenderer.invoke('api', 'check-health').then(value => this.state.test = value)
    }

    state = {
        search: '',
    };

    onSearch = (event) => {
        this.setState({ search: event.target.value });
    };

    render() {
        const search = (
            <Search
                onChange={(event) => {
                    console.log('Search term:', event.target.value);
                    this.onSearch(event);
                }}
                placeholder="Find an app"
                assistiveText={{ label: 'Find an app' }}
            />
        );
        const headerButton = <Button label="Header Button" />;

        return (
            <IconSettings iconPath="/assets/icons">
                <GlobalNavigationBar>
                    <GlobalNavigationBarRegion region="primary">
                        <AppLauncher
                            triggerName={MyAppLauncher.displayName}
                            search={search}
                            modalHeaderButton={headerButton}
                        >
                            <AppLauncherExpandableSection title="Tile Section">
                                <AppLauncherTile
                                    description="Edit configs of blt"
                                    iconBackgroundColor="#b67e6a"
                                    iconText="CC"
                                    search={this.state.search}
                                    title="Configs"
                                />
                                <AppLauncherTile
                                    description="View and run blt docs"
                                    iconBackgroundColor="#69bad0"
                                    iconText="CS"
                                    search={this.state.search}
                                    title="Docs"
                                />
                            </AppLauncherExpandableSection>
                            <hr />
                            <AppLauncherExpandableSection title="All Items">
                                <AppLauncherLink search={this.state.search}>
                                    Docs
                                </AppLauncherLink>
                                <AppLauncherLink search={this.state.search}>
                                    Configs {this.state.test}
                                </AppLauncherLink>
                            </AppLauncherExpandableSection>
                        </AppLauncher>
                    </GlobalNavigationBarRegion>
                </GlobalNavigationBar>
            </IconSettings>
        );
    }
}

export default MyAppLauncher;

// ReactDOM.render(<Example />, mountNode);