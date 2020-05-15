import React from 'react';
import Default from "../../defaultpage/Default";
import SetupAssistant from "@salesforce/design-system-react/components/setup-assistant";
import ProgressBar from "@salesforce/design-system-react/components/progress-bar";
import ProgressIndicator from "@salesforce/design-system-react/components/progress-indicator";
import SetupAssistantStep from '@salesforce/design-system-react/components/setup-assistant/step';
import isElectron from "is-electron";
import {Button} from "@salesforce/design-system-react";
import Checkbox from "@salesforce/design-system-react/components/checkbox";

/*
This page will be a form for all the information blt needs to install
Then when the user clicks a button it sends all the information to
an expect script which installs blt and runs the adventure setup
*/
const subSteps = (step) => [
    {
        id: `step-${step}-substep0`,
        label: '<code>python+%3C%28curl+https%3A%2F%2Fsfdc-ansible.s3.amazonaws.com%2Fansiblebootstrap.py%29</code>',
        onRenderSetupAssistantAction: (
            <Checkbox
                id={`step-${step}-substep0-action`}
                checked
                oldEventParameterOrder={false}
                variant="toggle"
            />
        ),
    },
    {
        id: `step-${step}-substep1`,
        label:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        onRenderSetupAssistantAction: (
            <Button
                id={`step-${step}-substep1-action`}
                label="View in Trailhead"
                variant="link"
            />
        ),
    },
    {
        id: `step-${step}-substep2`,
        label: 'Lorem ipsum dolor sit amet, lorem ipsum dolor.',
        onRenderSetupAssistantAction: (
            <Button
                id={`step-${step}-substep2-action`}
                label="Add Users"
                variant="outline-brand"
            />
        ),
    },
];

const subStepsComplete = (step) => [
    {
        id: `step-${step}-substep0`,
        label: '<code>python+%3C%28curl+https%3A%2F%2Fsfdc-ansible.s3.amazonaws.com%2Fansiblebootstrap.py%29</code>',
        onRenderSetupAssistantAction: (
            <Button
                id={`step-${step}-substep0-action`}
                label="Install"
            />
        ),
    },
    {
        id: `step-${step}-substep1`,
        label:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        onRenderSetupAssistantAction: (
            <Button
                id={`step-${step}-substep1-action`}
                label="View in Trailhead"
                variant="link"
            />
        ),
    },
];

const subStepsIncomplete = (step) => [
    {
        id: `step-${step}-substep0`,
        label: 'Turn on Lightning for all users.',
        onRenderSetupAssistantAction: (
            <Checkbox
                id={`step-${step}-substep0-action`}
                oldEventParameterOrder={false}
                variant="toggle"
            />
        ),
    },
    {
        id: `step-${step}-substep1`,
        label:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        onRenderSetupAssistantAction: (
            <Button
                id={`step-${step}-substep1-action`}
                label="View in Trailhead"
                variant="link"
            />
        ),
    },
];

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
                                completedSteps={subStepsComplete('complete')}
                                id="card-step-1-progress-indicator"
                                orientation="vertical"
                                steps={subStepsComplete('complete')}
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
                            <ProgressIndicator
                                id="card-step-1-progress-indicator"
                                orientation="vertical"
                                steps={subStepsComplete('complete')}
                                variant="setup-assistant"
                            />)}
                        progress={0}
                    />
                </SetupAssistant>
            </Default>
        );
    }
}
export default Installer;