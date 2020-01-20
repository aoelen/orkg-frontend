import React, { Component } from 'react';
import { StyledEmptyData } from 'components/AddPaper/Contributions/styled';
import AddProperty from 'components/StatementBrowser/AddProperty';
import StatementItem from 'components/StatementBrowser/StatementItem';
import ContributionTemplate from './ContributionTemplate';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class TemplateWizard extends Component {
    render() {
        let propertyIds =
            Object.keys(this.props.resources.byId).length !== 0 && this.props.initialResourceId
                ? this.props.resources.byId[this.props.initialResourceId].propertyIds
                : [];
        let shared =
            Object.keys(this.props.resources.byId).length !== 0 && this.props.initialResourceId
                ? this.props.resources.byId[this.props.initialResourceId].shared
                : 1;
        return (
            <div className={'contributionData'}>
                {propertyIds.length > 0 ? (
                    propertyIds.map((propertyId, index) => {
                        let property = this.props.properties.byId[propertyId];
                        if (!property.isTemplate) {
                            return (
                                <StatementItem
                                    id={propertyId}
                                    label={property.label}
                                    predicateLabel={property.label}
                                    key={'statement-' + index}
                                    index={index}
                                    isExistingProperty={property.isExistingProperty ? true : false}
                                    enableEdit={shared <= 1 ? this.props.enableEdit : false}
                                    syncBackend={this.props.syncBackend}
                                    isLastItem={propertyIds.length === index + 1}
                                    openExistingResourcesInDialog={this.props.openExistingResourcesInDialog}
                                    isEditing={property.isEditing}
                                    isSaving={property.isSaving}
                                    selectedResource={this.props.initialResourceId}
                                    contextStyle={'Template'}
                                />
                            );
                        } else {
                            let valueIds =
                                Object.keys(this.props.properties.byId).length !== 0 ? this.props.properties.byId[propertyId].valueIds : [];
                            return valueIds.map((valueId, index) => {
                                let value = this.props.values.byId[valueId];
                                return (
                                    <ContributionTemplate
                                        key={`template-${index}-${valueId}`}
                                        id={valueId}
                                        label={value.label}
                                        propertyId={propertyId}
                                        resourceId={value.resourceId}
                                        enableEdit={this.props.enableEdit}
                                        syncBackend={this.props.syncBackend}
                                        openExistingResourcesInDialog={this.props.openExistingResourcesInDialog}
                                        isEditing={value.isEditing}
                                        isSaving={value.isSaving}
                                    />
                                );
                            });
                        }
                    })
                ) : (
                    <StyledEmptyData className="text-muted mt-3">
                        No data yet
                        <br />
                        <span style={{ fontSize: '0.875rem' }}>Start by adding a template or a property from below</span>
                        <br />
                    </StyledEmptyData>
                )}

                <AddProperty contextStyle="Template" syncBackend={false} resourceId={this.props.initialResourceId} />
            </div>
        );
    }
}

TemplateWizard.propTypes = {
    resources: PropTypes.object.isRequired,
    properties: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
    initialResourceId: PropTypes.string,
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    openExistingResourcesInDialog: PropTypes.bool
};

const mapStateToProps = (state, ownProps) => {
    return {
        resources: state.statementBrowser.resources,
        values: state.statementBrowser.values,
        properties: state.statementBrowser.properties
    };
};

const mapDispatchToProps = dispatch => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TemplateWizard);
