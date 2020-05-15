import React from 'react';
import Default from "../../defaultpage/Default";
import SetupAssistant from "@salesforce/design-system-react/components/setup-assistant";
import ProgressBar from "@salesforce/design-system-react/components/progress-bar";
import ProgressIndicator from "@salesforce/design-system-react/components/progress-indicator";
import SetupAssistantStep from '@salesforce/design-system-react/components/setup-assistant/step';
import isElectron from "is-electron";
import {Button, ScopedNotification} from "@salesforce/design-system-react";
import Checkbox from "@salesforce/design-system-react/components/checkbox";

/*
This page will be a form for all the information blt needs to install
Then when the user clicks a button it sends all the information to
an expect script which installs blt and runs the adventure setup

python <(curl https://sfdc-ansible.s3.amazonaws.com/ansiblebootstrap.py)
sudo_ansible-playbook $BOOTSTRAP
blt --project app/main adventure:--run gybo
*/
const install = (step) => [
    {
        id: `step-${step}-substep0`,
        label: 'Install Ansible Using the Following code',
        onRenderSetupAssistantAction: (
            <Button
                id={`step-${step}-substep0-action`}
                label="Install"
            />
        ),
    },
];
const bootstrap = (step) =>[
    {
        id: `step-${step}-substep0`,
        label: 'Bootstrap Ansible Using the Following code',
        onRenderSetupAssistantAction: (
            <Button
                id={`step-${step}-substep0-action`}
                label="Bootstrap"
            />
        ),
    },
]
const adventure = (step) =>[
    {
        id: `step-${step}-substep0`,
        label: 'Run the adventure using the Following code',
        onRenderSetupAssistantAction: (
            <Button
                id={`step-${step}-substep0-action`}
                label="Run Adventure"
            />
        ),
    },
]


class Installer extends React.Component {
    constructor(props) {
        super(props);
        if(isElectron())
            ;
            // i expect server to give me details about the install process
            // window.ipcRenderer.invoke('installer',{key: 'constructor'}).then(value => {
            //     // expect if ansible boostrap is complete, know that by if ~/.ansible exists and contains env.sh
            // })
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
                                    'Complete all the steps below to finish installing ansible',
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
                                id="card-step-1-progress-indicator"
                                orientation="vertical"
                                variant="setup-assistant"
                            />
                        )}
                        progress={0}
                    />
                    <SetupAssistantStep
                        heading="Install Ansible"
                        description="Run the installer"
                        estimatedTime="4 mins"
                        id="card-step-2"
                        isExpandable
                        isOpen={true}
                        onRenderContent={() => (
                            <React.Fragment>
                            <ProgressIndicator
                                id="card-step-1-progress-indicator"
                                orientation="vertical"
                                steps={install('complete')}
                                variant="setup-assistant"
                            />
                            <code>python &#x3C;(curl https://sfdc-ansible.s3.amazonaws.com/ansiblebootstrap.py)</code>
                            </React.Fragment>
                        )}
                        progress={0}
                    />
                    <SetupAssistantStep
                        heading="Bootstrap Ansible"
                        description="Run the bootstrapper"
                        estimatedTime="5 mins"
                        id="card-step-3"
                        isExpandable
                        isOpen={true}
                        onRenderContent={() => (
                            <React.Fragment>
                                <ProgressIndicator
                                    id="card-step-1-progress-indicator"
                                    orientation="vertical"
                                    steps={bootstrap('complete')}
                                    variant="setup-assistant"
                                />
                                <code>sudo_ansible-playbook $BOOTSTRAP</code>
                            </React.Fragment>
                        )}
                        progress={0}
                    />
                </SetupAssistant>

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
                        heading="Adventure Setup"
                        description="Enter Adventure Configurations"
                        estimatedTime="5 mins"
                        id="card-step-4"
                        isExpandable
                        isOpen={true}
                        onRenderContent={() => (
                            <React.Fragment>
                                <ProgressIndicator
                                    id="card-step-1-progress-indicator"
                                    orientation="vertical"
                                    steps={adventure('complete')}
                                    variant="setup-assistant"
                                />
                                <code>blt --project app/main adventure:--run gybo</code>
                            </React.Fragment>
                        )}
                        progress={0}
                    />
                    <SetupAssistantStep
                        heading="Run the Adventure"
                        description="Run the Adventure"
                        estimatedTime="5 mins"
                        id="card-step-4"
                        isExpandable
                        isOpen={true}
                        onRenderContent={() => (
                            <React.Fragment>
                                <ProgressIndicator
                                    id="card-step-1-progress-indicator"
                                    orientation="vertical"
                                    steps={adventure('complete')}
                                    variant="setup-assistant"
                                />
                                <code>blt --project app/main adventure:--run gybo</code>
                            </React.Fragment>
                        )}
                        progress={0}
                    />
                </SetupAssistant>
            </Default>
        );
    }
}
export default Installer;