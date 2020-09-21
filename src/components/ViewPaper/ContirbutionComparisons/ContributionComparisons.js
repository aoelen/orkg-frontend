import React from 'react';
import { Container, Alert } from 'reactstrap';
import ComparisonCard from 'components/ComparisonCard/ComparisonCard';
import useContributionComparison from './hooks/useContributionComparison';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const Title = styled.div`
    font-size: 18px;
    font-weight: 500;
    margin-top: 30px;
    margin-bottom: 5px;

    a {
        margin-left: 15px;
        span {
            font-size: 80%;
        }
    }
`;

const StyledLoadMoreButton = styled.div`
    padding-top: 0;
    & span {
        cursor: pointer;
        border: 1px solid rgba(0, 0, 0, 0.125);
        border-top: 0;
        border-top-right-radius: 0;
        border-top-left-radius: 0;
        border-bottom-right-radius: 6px;
        border-bottom-left-radius: 6px;
    }
    &.action:hover span {
        z-index: 1;
        color: #495057;
        text-decoration: underline;
        background-color: #f8f9fa;
    }
`;

function ContributionComparisons(props) {
    const [comparisons, isLoadingComparisons, hasNextPage, isLastPageReached, loadMoreComparisons] = useContributionComparison(props.contributionId);

    if (comparisons.length === 0 && !isLoadingComparisons) {
        return null;
    }

    return (
        <div>
            <Title>Comparisons</Title>

            <Container className="mt-3 p-0">
                {comparisons.length > 0 && (
                    <div>
                        {comparisons.map(comparison => {
                            return (
                                comparison && (
                                    <ComparisonCard
                                        rounded={!hasNextPage ? 'false' : 'true'}
                                        comparison={{ ...comparison }}
                                        key={`pc${comparison.id}`}
                                    />
                                )
                            );
                        })}
                    </div>
                )}
                {!isLoadingComparisons && hasNextPage && (
                    <StyledLoadMoreButton className="text-right action">
                        <span className="btn btn-link btn-sm" onClick={!isLoadingComparisons ? loadMoreComparisons : undefined}>
                            + Load more
                        </span>
                    </StyledLoadMoreButton>
                )}
                {isLoadingComparisons && (
                    <StyledLoadMoreButton className="text-right action">
                        <span className="btn btn-link btn-sm">
                            {' '}
                            <Icon icon={faSpinner} spin /> Loading...
                        </span>
                    </StyledLoadMoreButton>
                )}
                {!hasNextPage && isLastPageReached && <div className="text-center mt-3">You have reached the last page.</div>}
            </Container>
        </div>
    );
}

ContributionComparisons.propTypes = {
    contributionId: PropTypes.string.isRequired
};

export default ContributionComparisons;
