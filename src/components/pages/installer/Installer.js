import React from 'react';
import Default from "../../defaultpage/Default";
import SetupAssistant from "@salesforce/design-system-react/components/setup-assistant";
import ProgressBar from "@salesforce/design-system-react/components/progress-bar";

/*
This page will be a form for all the information blt needs to install
Then when the user clicks a button it sends all the information to
an expect script which installs blt and runs the adventure setup
*/
class Installer extends React.Component {
    render() {
        return (
            <Default title={'Installer'}>
                <SetupAssistant
                    id="card-setup-assistant"
                    isCard
                    progressBar={
                        <ProgressBar
                            color="success"
                            id="card-setup-assistant-progress-bar"
                            labels={{
                                label:
                                    'Complete all the steps below to finish setting up Einstein Visibility',
                            }}
                            radius="circular"
                            value={50}
                            variant="light"
                        />
                    }
                >
                </SetupAssistant>
            </Default>
        );
    }
}
export default Installer;