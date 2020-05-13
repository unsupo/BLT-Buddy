import React from 'react';
import BrandBand from '@salesforce/design-system-react/components/brand-band';

// const __html = require('../../docs/doc/toc.html');
// const template = {__html: __html};

class Docs extends React.Component {
    render() {
        return (
            <BrandBand
                id="brand-band-lightning-blue"
                size="large"
                backgroundSize="cover"
                className="slds-p-around_large">
                <div className="slds-box slds-theme_default">
                    <h3 className="slds-text-heading_label slds-truncate">Docs</h3>
                </div>
                <br/>
                <div className="slds-box slds-theme_default">
                    <iframe src='file:///Users/jarndt/blt/blt-code/plugins/blt/doc/toc.html'></iframe>
                    {/*<div dangerouslySetInnerHTML={template} />*/}
                </div>
            </BrandBand>
        );
    }
}
export default Docs;
// Example.displayName = 'BrandBandExample';
//
// ReactDOM.render(<Docs />, mountNode);