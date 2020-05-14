import React from 'react';
import Default from "../defaultpage/Default";

/*
This is where you create timings.  Timings are used
to schedule when actions take place.
on login do a sync and build or every day do a sync and build
or at 5am start the app and at 5pm stop the app ect
 */
class Timings extends React.Component {
    render() {
        return (
            <Default title={'Timings'}>
                <p>HI</p>
            </Default>
        );
    }
}
export default Timings;