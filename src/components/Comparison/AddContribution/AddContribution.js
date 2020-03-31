import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Input, Label, ListGroup, ListGroupItem, InputGroup } from 'reactstrap';
import { getResourcesByClass, getStatementsBySubjectAndPredicate } from 'network';
import ContentLoader from 'react-content-loader';
import Tooltip from 'components/Utils/Tooltip';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const StyledLoadMoreButton = styled.div`
    padding-top: 0;
    & span {
        cursor: pointer;
        border: 2px solid rgba(0, 0, 0, 0.125);
        border-top: 0;
        border-top-right-radius: 0;
        border-top-left-radius: 0;
        border-bottom-right-radius: 12px;
        border-bottom-left-radius: 12px;
    }
    &.action:hover span {
        z-index: 1;
        color: #495057;
        text-decoration: underline;
        background-color: #f8f9fa;
    }
`;

const StyledListGroupItem = styled(ListGroupItem)`
    overflow-wrap: break-word;
    word-break: break-all;

    &:last-child {
        border-bottom-right-radius: ${props => (props.rounded === 'true' ? '0 !important' : '')};
    }
`;

export default function AddContribution(props) {
    const [searchPaper, setSearchPaper] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);

    const [paperResult, setPaperResult] = useState([]);
    const [selectedContributions, setSelectedContributions] = useState([]);

    const numberOfPaper = 10;

    const loadMoreResults = (searchQuery, page) => {
        if (searchQuery.length === 0) {
            setPaperResult([]);
            setCurrentPage(1);
            return;
        }
        setIsNextPageLoading(true);
        getResourcesByClass({
            page: page || currentPage,
            items: numberOfPaper,
            sortBy: 'id',
            desc: true,
            q: searchQuery,
            id: process.env.REACT_APP_CLASSES_PAPER
        })
            .then(results => {
                if (results.length > 0) {
                    const paper = results.map(resource =>
                        getStatementsBySubjectAndPredicate({
                            subjectId: resource.id,
                            predicateId: process.env.REACT_APP_PREDICATES_HAS_CONTRIBUTION
                        }).then(contributions => {
                            return {
                                ...resource,
                                contributions: contributions
                                    .sort((a, b) => {
                                        return a.object.label.localeCompare(b.object.label);
                                    })
                                    .map(contribution => ({ ...contribution.object, checked: false }))
                            };
                        })
                    );
                    Promise.all(paper).then(paperData => {
                        setPaperResult(prev => [...(prev || []), ...paperData]);
                        setIsNextPageLoading(false);
                        setHasNextPage(results.length < numberOfPaper ? false : true);
                        setCurrentPage(page);
                    });
                } else {
                    setIsNextPageLoading(false);
                    setHasNextPage(false);
                }
            })
            .catch(error => {
                console.log(error);
                toast.error('Something went wrong while loading search results.');
            });
    };

    const toggleContribution = contributionsID => {
        if (!selectedContributions.includes(contributionsID)) {
            setSelectedContributions(prev => [...prev, contributionsID]);
        } else {
            setSelectedContributions(selectedContributions.filter(i => i !== contributionsID));
        }
    };

    const togglePaper = (paper, e) => {
        console.log(e.target.checked);
        let newSelectedContributions = selectedContributions;
        if (paper.contributions.length > 0) {
            paper.contributions.map(contribution => {
                if (e.target.checked && !selectedContributions.includes(contribution.id)) {
                    //setSelectedContributions(prev => [...prev, contribution.id]);
                    newSelectedContributions = [...newSelectedContributions, contribution.id];
                } else if (!e.target.checked) {
                    newSelectedContributions = [...newSelectedContributions.filter(i => i !== contribution.id)];
                }
                return null;
            });
        }
        setSelectedContributions(newSelectedContributions);
    };

    useEffect(() => {
        setPaperResult([]);
        setHasNextPage(false);
        setCurrentPage(1);
        setSelectedContributions([]);
        loadMoreResults(searchPaper, 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchPaper]);

    return (
        <Modal isOpen={props.showDialog} toggle={props.toggle} size="lg">
            <ModalHeader toggle={props.toggle}>Add contribution</ModalHeader>
            <ModalBody>
                <p>Use the form below to search for a paper and add its contribution to comparison table.</p>
                <FormGroup>
                    <Label for="title">
                        <Tooltip message={'Enter the title of the paer'}>Paper title</Tooltip>
                    </Label>
                    <InputGroup>
                        <Input value={searchPaper} type="text" name="title" id="title" onChange={e => setSearchPaper(e.target.value)} />
                    </InputGroup>
                </FormGroup>
                <div>
                    {isNextPageLoading && paperResult.length === 0 && (
                        <ContentLoader height={110} speed={2} primaryColor="#f3f3f3" secondaryColor="#ecebeb">
                            <rect x="0" y="25" width="100%" height="15" />
                            <rect x="0" y="42" width="100%" height="15" />
                            <rect x="0" y="59" width="100%" height="15" />
                            <rect x="0" y="76" width="100%" height="15" />
                        </ContentLoader>
                    )}
                    <ListGroup>
                        {paperResult.map((paper, index) => {
                            return (
                                <StyledListGroupItem action key={`result-${index}`} className="pt-1 pb-1">
                                    <Label check className="pr-1 pl-1">
                                        <Input type="checkbox" onChange={e => togglePaper(paper, e)} /> {paper.label}
                                    </Label>
                                    {paper.contributions.length > 1 && (
                                        <ul style={{ listStyle: 'none' }}>
                                            {paper.contributions.map(contribution => {
                                                return (
                                                    <li key={`ccb${contribution.id}`}>
                                                        <Label check className="pr-1 pl-1">
                                                            <Input
                                                                type="checkbox"
                                                                checked={selectedContributions.includes(contribution.id)}
                                                                onChange={() => toggleContribution(contribution.id)}
                                                            />{' '}
                                                            {contribution.label}
                                                        </Label>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </StyledListGroupItem>
                            );
                        })}
                    </ListGroup>
                    {!isNextPageLoading && hasNextPage && (
                        <StyledLoadMoreButton className="text-right action">
                            <span className="btn btn-link btn-sm" onClick={() => loadMoreResults(searchPaper, currentPage + 1)}>
                                + Load more
                            </span>
                        </StyledLoadMoreButton>
                    )}
                    {isNextPageLoading && hasNextPage && (
                        <StyledLoadMoreButton className="text-right action">
                            <span className="btn btn-link btn-sm">Loading...</span>
                        </StyledLoadMoreButton>
                    )}
                </div>
            </ModalBody>
            <ModalFooter>
                <Button
                    disabled={selectedContributions.length === 0}
                    color="primary"
                    className="float-right"
                    onClick={() => {
                        props.addContributions(selectedContributions);
                        props.toggle();
                    }}
                >
                    Add to comparison
                    {selectedContributions.length > 0 && ` (${selectedContributions.length})`}
                </Button>
            </ModalFooter>
        </Modal>
    );
}
AddContribution.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    addContributions: PropTypes.func.isRequired
};
