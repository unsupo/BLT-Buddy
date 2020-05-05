import React from 'react';
import Spinner from '@salesforce/design-system-react/components/spinner';

class Constant extends React.Component {
    static displayName = 'SpinnerExample';

    render() {
        return (
            <div style={{ left: '6rem', bottom: '1.5rem', position: 'relative', width: '1rem', height: '1rem' }}>
                <Spinner
                    size="small"
                    variant="base"
                    assistiveText={{ label: 'Main Frame Loading...' }}
                />
            </div>
        );
    }
}

export default Constant;
// ReactDOM.render(<constant />, mountNode);