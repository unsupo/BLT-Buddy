import React from 'react';
import Default from "../../defaultpage/Default";
import SplitView from "@salesforce/design-system-react/components/split-view";
import SplitViewHeader from "@salesforce/design-system-react/components/split-view/header";
import Icon from "@salesforce/design-system-react/components/icon";
import SplitViewListbox from "@salesforce/design-system-react/components/split-view/listbox";

/*
This is where you create actions that you can use in the tray
or you can use in Timings
 */

const SORT_OPTIONS = {
    UP: 'up',
    DOWN: 'down',
};
const listOptions = [
    {
        id: '001',
        label: 'Riley Shultz',
        topRightText: '99',
        bottomLeftText: 'Biotech, Inc.',
        bottomRightText: 'Nurturing',
    },
    {
        id: '002',
        label: 'Jason A. - VP of Sales',
        topRightText: '92',
        bottomLeftText: 'Case Management Solutions',
        bottomRightText: 'Contacted',
    },
]
class Actions extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: typeof props.isOpen === 'boolean' ? props.isOpen : true,
            options: listOptions,
            selected: [listOptions[listOptions.length - 2]],
            unread: [listOptions[0], listOptions[2]],
            sortDirection: SORT_OPTIONS.DOWN,
        };

        this.sortList = this.sortList.bind(this);
    }
    sortList() {
        const sortDirection =
            this.state.sortDirection === SORT_OPTIONS.DOWN
                ? SORT_OPTIONS.UP
                : SORT_OPTIONS.DOWN;

        this.setState({
            options: this.state.options.sort(
                (a, b) =>
                    sortDirection === SORT_OPTIONS.DOWN
                        ? a.label > b.label
                        : b.label > a.label
            ),
            sortDirection,
        });
    }

    render() {
        return (
            <Default title={'Actions'}>
                <div style={{ height: '90vh' }}>
                    <SplitView
                        events={{
                            onClose: () => {
                                this.setState({ isOpen: false });
                            },
                            onOpen: () => {
                                this.setState({ isOpen: true });
                            },
                        }}
                        id="base-example"
                        isOpen={this.state.isOpen}
                        master={this.masterView()}
                        detail={this.detailView()}
                    />
                </div>
            </Default>
        );
    }
    masterView() {
        return [
            <SplitViewHeader
                key="1"
                // onRenderActions={headerActions}
                // onRenderControls={headerControls}
                icon={
                    <Icon
                        assistiveText={{ label: 'User' }}
                        category="standard"
                        name="action_list_component"
                    />
                }
                info="Create Actions"
                // info="42 items • Updated just now"
                title={"Actions"}
                truncate
                variant="object-home"
            />,
            <SplitViewListbox
                key="2"
                labels={{
                    header: 'Lead Score',
                }}
                sortDirection={this.state.sortDirection}
                options={this.state.options}
                events={{
                    onSort: this.sortList,
                    onSelect: (event, { selectedItems, item }) => {
                        this.setState({
                            unread: this.state.unread.filter((i) => i !== item),
                            selected: selectedItems,
                        });
                    },
                }}
                selection={this.state.selected}
                unread={this.state.unread}
            />,
        ];
    }

    detailView() {
        return this.state.selected.length ? (
            this.state.selected.map((item) => (
                <dl
                    key={item.id}
                    className="slds-box slds-m-left_medium slds-m-bottom_medium slds-list_horizontal slds-wrap"
                >
                    <dt
                        className="slds-item_label slds-text-color_weak slds-truncate"
                        title="Name"
                    >
                        Name:
                    </dt>
                    <dd className="slds-item_detail slds-truncate" title={item.label}>
                        {item.label}
                    </dd>
                    <dt
                        className="slds-item_label slds-text-color_weak slds-truncate"
                        title="Value"
                    >
                        Value:
                    </dt>
                    <dd
                        className="slds-item_detail slds-truncate"
                        title={item.topRightText}
                    >
                        {item.topRightText}
                    </dd>
                    <dt
                        className="slds-item_label slds-text-color_weak slds-truncate"
                        title="Company"
                    >
                        Company:
                    </dt>
                    <dd
                        className="slds-item_detail slds-truncate"
                        title={item.bottomLeftText}
                    >
                        {item.bottomLeftText}
                    </dd>
                    <dt
                        className="slds-item_label slds-text-color_weak slds-truncate"
                        title="Status"
                    >
                        Status:
                    </dt>
                    <dd
                        className="slds-item_detail slds-truncate"
                        title={item.bottomRightText}
                    >
                        {item.bottomRightText}
                    </dd>
                </dl>
            ))
        ) : (
            <div />
        );
    }
}
export default Actions;