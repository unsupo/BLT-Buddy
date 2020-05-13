import React from 'react';
import BrandBand from '@salesforce/design-system-react/components/brand-band';

class TrayCustomizer extends React.Component {
    render() {
        return (
            <BrandBand
                id="brand-band-lightning-blue"
                size="large"
                backgroundSize="cover"
                className="slds-p-around_large">
                <div className="slds-box slds-theme_default">
                    <h3 className="slds-text-heading_label slds-truncate">Tray Customizer</h3>
                </div>
            </BrandBand>
        );
    }
}
export default TrayCustomizer;
// Example.displayName = 'BrandBandExample';
//
// ReactDOM.render(<Docs />, mountNode);