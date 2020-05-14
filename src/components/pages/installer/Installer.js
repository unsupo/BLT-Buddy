import React from 'react';
import Default from "../../defaultpage/Default";
import SetupAssistant from "@salesforce/design-system-react/components/setup-assistant";
import ProgressBar from "@salesforce/design-system-react/components/progress-bar";
import ProgressIndicator from "@salesforce/design-system-react/components/progress-indicator";
import SetupAssistantStep from '@salesforce/design-system-react/components/setup-assistant/step';
import isElectron from "is-electron";
import {Button} from "@salesforce/design-system-react";

/*
This page will be a form for all the information blt needs to install
Then when the user clicks a button it sends all the information to
an expect script which installs blt and runs the adventure setup
*/
class Installer extends React.Component {
    constructor(props) {
        super(props);
        if(isElectron())
            // i expect server to give me details about the install process
            window.ipcRenderer.invoke('installer',{key: 'constructor'}).then(value => {
                // expect if ansible boostrap is complete, know that by if ~/.ansible exists and contains env.sh
            })
    }

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
                                    'Complete all the steps below to finish installing BLT',
                            }}
                            radius="circular"
                            value={50}
                            variant="light"
                        />
                    }
                >
                    <SetupAssistantStep
                        description="Enter in Configurations"
                        estimatedTime="1 min"
                        heading="Ansible Setup"
                        id="card-step-1"
                        isExpandable

                        onRenderContent={() => (
                            <ProgressIndicator
                                // completedSteps={subStepsComplete('complete')}
                                id="card-step-1-progress-indicator"
                                orientation="vertical"
                                // steps={subStepsComplete('complete')}
                                variant="setup-assistant"
                            />
                        )}
                        progress={0}
                    />
                    <SetupAssistantStep
                        heading="Install Ansible"
                        description="Run the installer"
                        estimatedTime="4 mins"
                        id="base-step-2"
                        isExpandable
                        isOpen={true}
                        onRenderContent={() => (
                            <code>python <(curl https://sfdc-ansible.s3.amazonaws.com/ansiblebootstrap.py)</code>,
                            <Button
                                id="base-step-2-action"
                                label="Install"
                                variant="outline-brand"
                            />
                        )}
                        progress={0}
                    />
                </SetupAssistant>
            </Default>
        );
    }
}
export default Installer;