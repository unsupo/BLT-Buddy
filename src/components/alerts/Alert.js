import React from 'react';
import Alert from '@salesforce/design-system-react/components/alert';
import AlertContainer from '@salesforce/design-system-react/components/alert/container';
import Icon from '@salesforce/design-system-react/components/icon';
import IconSettings from '@salesforce/design-system-react/components/icon-settings';

class Alert extends React.Component {
    render() {
        return (
            <IconSettings iconPath="/assets/icons">
                <AlertContainer>
                    <Alert
                        icon={<Icon category="utility" name="error" />}
                        labels={{
                            heading:
                                this.props.heading,
                            headingLink: 'More Information',
                        }}
                        onClickHeadingLink={() => {
                            console.log('Link clicked.');
                        }}
                        variant="error"
                    />
                </AlertContainer>
            </IconSettings>
        );
    }
}

export default Alert
