import React, { Component } from 'react';
import { crossrefUrl, submitGetRequest } from '../../../../network';
import { ListGroup, ListGroupItem, Collapse } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash, faChevronCircleDown, faChevronCircleRight } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '../../../Utils/Tooltip';
import styles from '../Contributions.module.scss';
import classNames from 'classnames';
import ValueItem from './Value/ValueItem';
import AddValue from './Value/AddValue';
import DeleteStatement from './DeleteStatement';
import { throws } from 'assert';

class Statement extends Component {
    constructor(props) {
        super(props);

        this.state = {
            deleteContributionModal: false,
        }
    }

    toggleDeleteContribution = () => {
        this.setState(prevState => ({
            deleteContributionModal: !prevState.deleteContributionModal
        }));
    }

    render() {
        const listGroupClass = classNames({
            [styles.statementActive]: this.props.collapse,
            [styles.statementItem]: true
        });

        const chevronClass = classNames({
            [styles.statementItemIcon]: true,
            [styles.open]: this.props.collapse,
            'float-right': true
        });

        return (
            <>
                <ListGroupItem active={this.props.collapse} onClick={() => this.props.toggleCollapseStatement(this.props.index)} className={listGroupClass}>
                    {this.props.predicateLabel.charAt(0).toUpperCase() + this.props.predicateLabel.slice(1)}

                    <Icon icon={this.props.collapse ? faChevronCircleDown : faChevronCircleRight} className={chevronClass} />{' '}

                    <DeleteStatement handleDelete={() => this.props.handleDelete(this.props.predicateId)} /> 
                </ListGroupItem>
                <Collapse isOpen={this.props.collapse}>
                    <div className={styles.listGroupOpen}>
                        <ListGroup flush>
                            <ValueItem label="Configuration 1" />
                            <ValueItem label="Configuration 2" />
                            
                            <AddValue />
                        </ListGroup>
                    </div>
                </Collapse>
                
            </>
        );
    }
}

export default Statement;