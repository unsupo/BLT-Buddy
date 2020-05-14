import React from 'react';
import Default from "../defaultpage/Default";

/*
This page will be a form for all the information blt needs to install
Then when the user clicks a button it sends all the information to
an expect script which installs blt and runs the adventure setup
*/
class Installer extends React.Component {
    render() {
        return (
            <Default title={'Installer'}>
                <p>HI</p>
            </Default>
        );
    }
}
export default Installer;