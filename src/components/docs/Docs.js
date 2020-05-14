import React from 'react';
import Default from "../defaultpage/Default";

// const __html = require('../../docs/doc/toc.html');
// const template = {__html: __html};

class Docs extends React.Component {
    render() {
        return (
            <Default title={'Documentation'}>
                <p>HI</p>
            </Default>
        );
    }
}
export default Docs;