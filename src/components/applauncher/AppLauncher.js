import React from 'react';

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

    constructor(apps) {
        super();
        this.apps = apps;
    }

    componentDidMount() {
        // if (isElectron()) {
        //     console.log(window.ipcRenderer);
        //     // window.ipcRenderer.invoke('api', {cmd:'check-health'}).then(value => this.setState({'health':JSON.parse(value['res'])['app']['ui_check']}))
        // }
    }

    state = {
        search: '',
        isOpenV: undefined
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
        const headerButton = <Button label="HI" />;

        return (
            <IconSettings iconPath="/assets/icons">
                <GlobalNavigationBar>
                    <GlobalNavigationBarRegion region="primary">
                        <AppLauncher
                            ariaHideApp={false}
                            triggerName={MyAppLauncher.displayName}
                            search={search}
                            onClose={this.close.bind(this)}
                            triggerOnClick={this.open.bind(this)}
                            isOpen={this.state.isOpenV}
                            modalHeaderButton={headerButton}>
                            <AppLauncherExpandableSection title="Tile Section">
                                { this.createTiles() }
                            </AppLauncherExpandableSection>
                            <hr />
                            <AppLauncherExpandableSection title="All Items">
                                { this.createLinks() }
                            </AppLauncherExpandableSection>
                        </AppLauncher>
                    </GlobalNavigationBarRegion>
                </GlobalNavigationBar>
            </IconSettings>
        );
    }
    open(){
        this.setState({isOpenV: true})
    }
    close(){
        this.setState({isOpenV: false})
    }
    onClickEvent(e,t){
        this.setState({isOpenV: false});
        this.props.sendData(e, t)
    }

    createTiles() {
        let tiles = []
        Array.prototype.forEach.call(this.props.apps,v=>
            tiles.push(<AppLauncherTile
                key={v.title}
                description={v.description}
                iconBackgroundColor={v.color}
                iconText={v.iconText}
                search={this.state.search}
                title={v.title}
                onClick={((e) =>this.onClickEvent(e,v.title))}
            />))
        return tiles
    }
    createLinks() {
        let links = []
        Array.prototype.forEach.call(this.props.apps,v=>
            links.push(
                <AppLauncherLink key={v.title} search={this.state.search} onClick={((e) => this.onClickEvent(e,v.title))}>
                    {v.title}
                </AppLauncherLink>))
        return links
    }
}

export default MyAppLauncher;