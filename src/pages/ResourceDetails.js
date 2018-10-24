import React, {Component} from 'react';
import NewStatementsSection from '../components/statements/new/NewStatementsSection';
import StatementGroupCard from '../components/statements/existing/StatementGroupCard';
import {getPredicate, getResource, resourcesUrl, statementsUrl, submitGetRequest} from '../network';
import {groupBy} from '../utils';
import './ResourceDetails.css';
import {Nav, NavLink} from 'reactstrap';
import EditableHeader from '../components/EditableHeader';

export const descriptionSection = 'description';
export const implementationSection = 'implementation';
export const evaluationSection = 'evaluation';
export const miscSection = 'misc';
const sections = [descriptionSection, implementationSection, evaluationSection, miscSection];

export default class ResourceDetails extends Component {

    state = {
        allStatements: null,
        results: null,
        error: null,
        title: null,
        predicateMap: {},
        objectMap: {},
    };

    initialState = this.state;
    componentWillMount() {
        this.findResource();
        this.findAllStatements();
    }

    findResource = () => {
        const that = this;

        submitGetRequest(resourcesUrl + this.props.id + '/',
                (responseJson) => {
                    that.setState({
                        title: responseJson.label,
                    });
                },
                (err) => {
                    console.error(err);
                    that.setState({
                        title: null,
                        error: err.message,
                    });
                });
    };

    findAllStatements = () => {
        const that = this;

        submitGetRequest(statementsUrl,
            (responseJson) => {
                that.setState({
                    allStatements: responseJson,
                    error: null,
                });
            },
            (err) => {
                console.error(err);
                that.setState({
                    allStatements: null,
                    error: err.message,
                });
            });
    };

    updateMissingPredicateLabels = () => {
        // TODO: implement more efficient way to fetch all predicates instead of querying them one by one.
        const that = this;
        this.state.allStatements.forEach((statement) => {
            if (!that.state.predicateMap[statement.predicate]) {
                getPredicate(statement.predicate,
                    (responseJson) => {
                        const predicateMap = that.state.predicateMap;
                        predicateMap[responseJson.id] = responseJson.label;
                        that.forceUpdate();
                    },
                    (err) => {
                        console.error(err);
                    });
            }
        });
    };

    updateMissingObjectLabels = () => {
        // TODO: implement more efficient way to fetch all objects instead of querying them one by one.
        const that = this;
        this.state.allStatements.forEach((statement) => {
            if (!that.state.objectMap[statement.statementId]) {
                switch (statement.object.type) {
                    case 'literal': {
                        that.setStatementText(statement)(statement.object.value);
                        break;
                    }
                    case 'resource': {
                        getResource(statement.object.id,
                                (responseJson) => {
                                    that.setStatementText(statement)(responseJson.label);
                                    that.forceUpdate();
                                },
                                (err) => {
                                    console.error(err);
                                });
                        break;
                    }
                    default: {
                        throw new Error('Unknown statement object type: ' + statement.object.type + '.');
                    }
                }
            }
        });
    };

    reset = () => {
        this.findAllStatements();
        this.setState(this.initialState);
    };

    getStatementText = (statement) => {
        const that = this;
        return () => {
            return that.state.objectMap[statement.statementId] || statement.object.id;
        }
    };

    setStatementText = (statement) => {
        const that = this;
        return (text) => {
            that.state.objectMap[statement.statementId] = text;
        }
    };

    handleHeaderChange = (event) => {
        this.setState({title: event.value});
    };

    render() {
        const id = this.props.id;
        const resultsPresent = this.state.error || (this.state.allStatements);
        const labelId = "http://www.w3.org/2000/01/rdf-schema#label";
        const abstractId = "http://orkg.tib.eu/ontology/abstract";

        if (this.state.error) {
            return <p><strong>Error:</strong> {this.state.error} </p>;
        }

        if (resultsPresent) {
            this.updateMissingPredicateLabels();
            this.updateMissingObjectLabels();

            const titleText = this.state.title;
            const titleJsx = titleText && <EditableHeader {...this.props} value={titleText}
                    onChange={this.handleHeaderChange}/>;

            const abstractText = this.state.allStatements.find(statement => statement.subject === id
                    && statement.predicate === abstractId);
            const abstractJsx = abstractText && <div>{abstractText.object.id}</div>;

            const groupingProperty = "predicate";
            const statements = this.state.allStatements.filter(statement => statement.subject === id
                    && statement.predicate !== labelId && statement.predicate !== abstractId);
            const groupedStatements = groupBy(statements, groupingProperty);
            const statementGroupJsxs = groupedStatements.map(
                statementGroup => {
                    if (statementGroup.length > 0) {
                        const propertyId = statementGroup[0][groupingProperty];
                        return <StatementGroupCard href={`${process.env.PUBLIC_URL}/predicate/${propertyId}`}
                                key={propertyId}
                                label={this.state.predicateMap[propertyId] || propertyId}
                                onUpdate={this.reset} statementGroup={statementGroup}
                                getStatementText={this.getStatementText}
                                setStatementText={this.setStatementText}/>
                    } else {
                        return null;
                    }
                }
            );

            const newStatementsSectionJsx = <NewStatementsSection subjectId={id} onUpdate={this.reset}/>;
            // const navigationButtons = <ButtonGroup>
            //     <Button disabled={this.props.sectionName === descriptionSection}
            //             onClick={() => window.location = descriptionSection}>
            //         Address
            //     </Button>
            //     <Button disabled={this.props.sectionName === implementationSection}
            //             onClick={() => window.location = implementationSection}>
            //         Implementation
            //     </Button>
            //     <Button disabled={this.props.sectionName === evaluationSection}
            //             onClick={() => window.location = evaluationSection}>
            //         Evaluation
            //     </Button>
            //     <Button disabled={this.props.sectionName === miscSection}
            //             onClick={() => window.location = miscSection}>
            //         Misc
            //     </Button>
            // </ButtonGroup>;

            // const navigationButtons = <Nav>
            //     <NavItem>
            //         <Button disabled={this.props.sectionName === descriptionSection}
            //                 onClick={() => window.location = descriptionSection}>
            //             Address
            //         </Button>
            //     </NavItem>
            //     <NavItem>
            //         <Button disabled={this.props.sectionName === implementationSection}
            //                 onClick={() => window.location = implementationSection}>
            //             Implementation
            //         </Button>
            //     </NavItem>
            //     <NavItem>
            //         <Button disabled={this.props.sectionName === evaluationSection}
            //                 onClick={() => window.location = evaluationSection}>
            //             Evaluation
            //         </Button>
            //     </NavItem>
            //     <NavItem>
            //         <Button disabled={this.props.sectionName === miscSection}
            //                 onClick={() => window.location = miscSection}>
            //             Misc
            //         </Button>
            //     </NavItem>
            // </Nav>;

            const sectionName = this.props.sectionName;
            const navigationButtons = <Nav tag="div">
                <NavLink href={descriptionSection} disabled={sectionName === descriptionSection}>
                    Problem description
                </NavLink>
                <NavLink href={implementationSection} disabled={sectionName === implementationSection}>
                    Implementation
                </NavLink>
                <NavLink href={evaluationSection} disabled={sectionName === evaluationSection}>
                    Evaluation
                </NavLink>
                <NavLink href={miscSection} disabled={sectionName === miscSection}>
                    Misc
                </NavLink>
            </Nav>;

            const sectionIndex = sections.findIndex((value) => value === sectionName);
            const bottomNavigationButtons = <Nav className="bottomNavigator" tag="div">
                <NavLink className="btn btn-primary" href={sections[sectionIndex - 1]} disabled={!(sectionIndex > 0)}>
                    Previous
                </NavLink>
                <NavLink className="btn btn-primary" href={sections[sectionIndex + 1]} disabled={!(sectionIndex < sections.length - 1)}>
                    Next
                </NavLink>
            </Nav>;

            return <div className="entityView-main">
                {[titleJsx, abstractJsx, navigationButtons].concat(statementGroupJsxs)
                        .concat([newStatementsSectionJsx, bottomNavigationButtons])}
            </div>;
        } else {
            return null;
        }
    }
}