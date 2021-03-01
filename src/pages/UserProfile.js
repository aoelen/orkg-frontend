import { useState, useEffect } from 'react';
import { Container, Row } from 'reactstrap';
import PropTypes from 'prop-types';
import { getUserInformationById } from 'services/backend/users';
import Items from 'components/UserProfile/Items';
import { getObservatoryById } from 'services/backend/observatories';
import { getOrganization } from 'services/backend/organizations';
import NotFound from 'pages/NotFound';
import { useSelector } from 'react-redux';
import Gravatar from 'react-gravatar';
import styled from 'styled-components';
import { CLASSES } from 'constants/graphSettings';

const StyledGravatar = styled(Gravatar)`
    border: 3px solid ${props => props.theme.avatarBorderColor};
`;
/*
const StyledActivity = styled.div`
    border-left: 3px solid #e9ebf2;
    color: ${props => props.theme.bodyColor};
    .time {
        color: rgba(100, 100, 100, 0.57);
        margin-top: -0.2rem;
        margin-bottom: 0.2rem;
        font-size: 15px;
    }
    .time::before {
        width: 1rem;
        height: 1rem;
        margin-left: -1.6rem;
        margin-right: 0.5rem;
        border-radius: 15px;
        content: '';
        background-color: #c2c6d6;
        display: inline-block;
    }
    a {
        color: ${props => props.theme.ORKGPrimaryColor};
    }

    &:last-child {
        border-left: none;
        padding-left: 1.2rem !important;
    }
`;
*/
const UserProfile = props => {
    const [userData, setUserData] = useState('');
    const [observatoryData, setObservatoryData] = useState(null);
    const [organizationData, setOrganizationData] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const userId = props.match.params.userId;
    const currentUserId = useSelector(state => state.auth.user?.id);

    useEffect(() => {
        const getUserInformation = async () => {
            setNotFound(false);

            try {
                const userData = await getUserInformationById(userId);
                setUserData(userData);
                if (userData.observatory_id) {
                    getObservatoryById(userData.observatory_id)
                        .then(observatory => {
                            setObservatoryData(observatory);
                        })
                        .catch(error => {
                            setObservatoryData(null);
                        });
                }

                if (userData.organization_id) {
                    getOrganization(userData.organization_id)
                        .then(organization => {
                            setOrganizationData(organization);
                        })
                        .catch(err => {
                            setOrganizationData(null);
                        });
                }
            } catch (e) {
                setNotFound(true);
            }
        };

        getUserInformation();
    }, [userId]);

    if (notFound) {
        return <NotFound />;
    }

    return (
        <>
            <Container>
                <Row>
                    <div className="col-2 text-center">
                        <StyledGravatar className="rounded-circle" email={userData?.email ?? 'example@example.com'} size={100} id="TooltipExample" />
                    </div>
                    <div className="col-9 box rounded pt-4 pb-3 pl-5 pr-2">
                        <h2 className="h3">{userData.display_name}</h2>
                        {observatoryData && (
                            <p>
                                <b className="d-block">Observatory</b>
                                {observatoryData?.name}
                            </p>
                        )}
                        {organizationData && (
                            <p>
                                <b className="d-block">Organization</b>
                                {organizationData?.name}
                            </p>
                        )}
                    </div>
                </Row>
            </Container>

            <Container className="d-flex align-items-center mt-4 mb-4">
                <h1 className="h4 flex-grow-1">Published comparisons</h1>
            </Container>
            <Container className="p-0">
                <Items filterLabel="comparisons" filterClass={CLASSES.COMPARISON} userId={userId} />
            </Container>

            <Container className="d-flex align-items-center mt-4 mb-4">
                <h1 className="h4 flex-grow-1">Added papers</h1>
            </Container>
            <Container className="p-0">
                <Items filterLabel="papers" filterClass={CLASSES.PAPER} userId={userId} showDelete={userId === currentUserId} />
            </Container>
            {/*
            TODO: support for activity feed
            <Container className="box mt-4 pt-4 pb-3 pl-5 pr-5">
            <h5 className="mb-4">Activity feed</h5>
            <StyledActivity className="pl-3 pb-3">
                <div className={'time'}>16 JULY 2019</div>
                <div>
                    John Doe updated resource <Link to={'/'}>IoT research directions</Link>
                </div>
            </StyledActivity>
            <StyledActivity className="pl-3 pb-3">
                <div className={'time'}>10 JULY 2019</div>
                <div>
                    John Doe updated resource <Link to={'/'}>IoT research directions</Link>
                </div>
                <div>
                    John Doe commented on predicate <Link to={'/'}>Has Problem</Link>
                </div>
            </StyledActivity>
            <StyledActivity className="pl-3 pb-3">
                <div className={'time'}>5 JULY 2019</div>
                <div>John Doe joined ORKG, welcome!</div>
            </StyledActivity>
            </Container>*/}
        </>
    );
};

UserProfile.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            userId: PropTypes.string
        }).isRequired
    }).isRequired
};

export default UserProfile;
