import React from 'react';
import Default from "../../defaultpage/Default";
import {PageHeaderControl} from "@salesforce/design-system-react";

/*
This is where you create actions that you can use in the tray
or you can use in Timings
 */
class Monitoring extends React.Component {
    render() {
        return (
            <Default title={'Monitoring'}>
                <PageHeader
                    details={[
                        {
                            label: 'Field 1',
                            content:
                                'Description that demonstrates truncation with content. Description that demonstrates truncation with content.',
                            truncate: true}
                    ]}
                    icon={
                        <Icon
                            assistiveText={{ label: 'User' }}
                            category="standard"
                            name="opportunity"
                        />
                    }
                    label="Record Type"
                    // onRenderActions={actions}
                    title="Record Title"
                    variant="record-home"
                />
            </Default>
        );
    }
}
export default Monitoring;