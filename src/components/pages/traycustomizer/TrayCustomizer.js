import React from 'react';
import Default from "../defaultpage/Default";

/*
This page allows you to decide what goes in the tray.
You can add/or remove buttons or make new buttons
for actions like restart, sync then build ect
 */
class TrayCustomizer extends React.Component {
    render() {
        return (
            <Default title={'Tray Customizer'}>
                <p>HI</p>
            </Default>
        );
    }
}
export default TrayCustomizer;