import React, { Component } from 'react';
import { crossrefUrl, submitGetRequest, predicatesUrl, resourcesUrl } from '../../../../network';
import { Container, Row, Col, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon, Button, ButtonGroup, FormFeedback, Table, Card, ListGroup, ListGroupItem, CardDeck, Modal, ModalHeader, ModalBody, ModalFooter, Collapse, DropdownToggle, DropdownMenu, InputGroupButtonDropdown, DropdownItem } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash, faChevronCircleDown } from '@fortawesome/free-solid-svg-icons';
import { range } from '../../../../utils';
import Tooltip from '../../../Utils/Tooltip';
import TagsInput from '../../../Utils/TagsInput';
import FormValidator from '../../../Utils/FormValidator';
import { getStatementsBySubject } from '../../../../network';
import styles from '../Contributions.module.scss';
import StatementItem from './StatementItem';
import AutoComplete from './AutoComplete';

class AddStatement extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showAddStatement: false,
            newPredicateValue: '',
            confirmNewPropertyModal: false,
            newPropertyLabel: '',
        }
    }

    handleShowAddStatement = () => {
        this.setState({
            showAddStatement: true,
        });
    }

    handleHideAddStatement = () => {
        this.setState({
            showAddStatement: false,
            newPredicateValue: '',
        });
    }

    /*handleAddStatement = () => {
        this.handleHideAddStatement();
    }*/

    handleInputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    handlePropertySelect = ({ id, value }) => {
        this.props.handleAdd({
            predicateId: id,
            propertyLabel: value
        });

        this.setState({
            showAddStatement: false
        });
    }

    toggleConfirmNewProperty = (propertyLabel) => {
        this.setState(prevState => ({
            confirmNewPropertyModal: !prevState.confirmNewPropertyModal,
            propertyLabel
        }));
    }

    handleNewProperty = () => {
        this.setState({
            showAddStatement: false
        });

        this.toggleConfirmNewProperty(); // hide dialog

        this.props.handleAdd({
            propertyLabel: this.state.propertyLabel
        });
    }

    render() {
        return (
            <>
                <ListGroupItem className={`${styles.statementItem} ${styles.statementItemInput}`}>
                    {this.state.showAddStatement ?
                        <InputGroup className={`${styles.addStatement} dropdown`}>
                            {/*<Input bsSize="sm"
                            placeholder="Enter a predicate"
                            name="newPredicateValue"
                            value={this.state.newPredicateValue}
                            onChange={this.handleInputChange} />*/}

                            <AutoComplete requestUrl={predicatesUrl}
                                placeholder="Enter a property"
                                onItemSelected={this.handlePropertySelect}
                                onNewItemSelected={this.toggleConfirmNewProperty}
                                onKeyUp={() => { }} />

                            <InputGroupAddon addonType="append">
                                <Button color="light" className={styles.addStatementActionButton} onClick={this.handleHideAddStatement}>Cancel</Button>
                                {/*<Button color="light" className={styles.addStatementActionButton} onClick={this.handleAddStatement}>Done</Button>*/}
                            </InputGroupAddon>

                        </InputGroup>
                        :
                        <span className="btn btn-link p-0 border-0 align-baseline" onClick={this.handleShowAddStatement}>
                            + Add statement
                    </span>
                    }
                </ListGroupItem>

                <Modal isOpen={this.state.confirmNewPropertyModal} toggle={this.toggleConfirmNewProperty}>
                    <ModalHeader toggle={this.toggleConfirmNewProperty}>Are you sure you need a new property?</ModalHeader>
                    <ModalBody>
                        Often there are existing properties that you can use as well. It is better to use existing properties then new ones.
                    </ModalBody>
                    <ModalFooter>
                        <Button color="light" onClick={this.toggleConfirmNewProperty}>Cancel</Button>{' '}
                        <Button color="primary" onClick={this.handleNewProperty}>Create new property</Button>
                    </ModalFooter>
                </Modal>
            </>
        );
    }
}

export default AddStatement;