import { useState, useEffect } from 'react';
import { Container, Button } from 'reactstrap';
import { getPredicate } from 'services/backend/predicates';
import StatementBrowser from 'components/StatementBrowser/StatementBrowser';
import InternalServerError from 'pages/InternalServerError';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import NotFound from 'pages/NotFound';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen, faTimes } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import PropertyStatements from 'components/PropertyStatements/PropertyStatements';
import { ENTITIES } from 'constants/graphSettings';
import TitleBar from 'components/TitleBar/TitleBar';
import EditModeHeader from 'components/EditModeHeader/EditModeHeader';

function Property(props) {
    const location = useLocation();
    const [error, setError] = useState(null);
    const [label, setLabel] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const propertyId = props.match.params.id;

    useEffect(() => {
        const findPredicate = async () => {
            setIsLoading(true);
            try {
                const responseJson = await getPredicate(propertyId);
                document.title = `${responseJson.label} - Property - ORKG`;

                setLabel(responseJson.label);
                setIsLoading(false);
            } catch (err) {
                console.error(err);
                setLabel(null);
                setError(err);
                setIsLoading(false);
            }
        };
        findPredicate();
    }, [location, propertyId]);

    return (
        <>
            {isLoading && <Container className="box rounded pt-4 pb-4 ps-5 pe-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoading && error && <>{error.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>}
            {!isLoading && !error && (
                <>
                    <TitleBar
                        buttonGroup={
                            !editMode ? (
                                <RequireAuthentication
                                    component={Button}
                                    className="float-end flex-shrink-0"
                                    color="secondary"
                                    size="sm"
                                    onClick={() => setEditMode(v => !v)}
                                >
                                    <Icon icon={faPen} /> Edit
                                </RequireAuthentication>
                            ) : (
                                <Button className="float-end flex-shrink-0" color="secondary-darker" size="sm" onClick={() => setEditMode(v => !v)}>
                                    <Icon icon={faTimes} /> Stop editing
                                </Button>
                            )
                        }
                    >
                        Property view
                    </TitleBar>
                    <Container className="p-0 clearfix">
                        <EditModeHeader isVisible={editMode} />
                        <div className={`box clearfix pt-4 pb-4 ps-5 pe-5 ${editMode ? 'rounded-bottom' : 'rounded'}`}>
                            <div className="mb-2">
                                <div className="pb-2 mb-3">
                                    <h3 className="" style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                        {label || (
                                            <i>
                                                <small>No label</small>
                                            </i>
                                        )}
                                    </h3>
                                </div>
                            </div>
                            <hr />
                            <h3 className="h5">Statements</h3>
                            <div className="clearfix">
                                <StatementBrowser
                                    rootNodeType={ENTITIES.PREDICATE}
                                    enableEdit={editMode}
                                    syncBackend={editMode}
                                    openExistingResourcesInDialog={false}
                                    initialSubjectId={propertyId}
                                    initialSubjectLabel={label}
                                    newStore={true}
                                    propertiesAsLinks={true}
                                    resourcesAsLinks={true}
                                />
                            </div>
                            <PropertyStatements propertyId={propertyId} />
                        </div>
                    </Container>
                </>
            )}
        </>
    );
}

Property.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string.isRequired
        }).isRequired
    }).isRequired
};

export default Property;
