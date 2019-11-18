import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { getStatementsByObject, getResource, getStatementsBySubject } from '../../network';
import PaperCard from '../PaperCard/PaperCard';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const AuthorMetaInfo = styled.div`
    .key {
        font-weight: bolder;
    }
    .value {
        margin-bottom: 10px;
    }
`;

const AuthorIdentifier = styled.div`
    .key {
        font-weight: bolder;
        margin-bottom: 4px;
    }
    .value {
        margin-bottom: 10px;
    }
`;

class AuthorPage extends Component {
    constructor(props) {
        super(props);

        this.pageSize = 5;

        this.state = {
            loading: true,
            isNextPageLoading: false,
            hasNextPage: false,
            page: 1,
            author: null,
            papers: [],
            isLastPageReached: false
        };
    }

    componentDidMount() {
        this.loadAuthorData();
        this.loadMorePapers();
    }

    componentDidUpdate = prevProps => {
        if (this.props.match.params.authorId !== prevProps.match.params.authorId) {
            this.loadAuthorData();
            this.loadMorePapers();
        }
    };

    loadAuthorData = () => {
        // Get the research field
        getResource(this.props.match.params.authorId).then(result => {
            this.setState({ author: result, papers: [], loading: false }, () => {
                document.title = `${this.state.author.label} - ORKG`;
            });
        });
    };

    loadMorePapers = () => {
        this.setState({ isNextPageLoading: true });
        // Get the statements that contains the author as an object
        getStatementsByObject({
            id: this.props.match.params.authorId,
            page: this.state.page,
            items: this.pageSize,
            sortBy: 'id',
            desc: true
        }).then(result => {
            // Papers
            if (result.length > 0) {
                // Fetch the data of each paper
                let papers = result
                    .filter(statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_AUTHOR)
                    .map(paper => {
                        return getStatementsBySubject({ id: paper.subject.id }).then(paperStatements => {
                            // publication year
                            let publicationYear = paperStatements.filter(
                                statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_PUBLICATION_YEAR
                            );
                            if (publicationYear.length > 0) {
                                publicationYear = publicationYear[0].object.label;
                            } else {
                                publicationYear = '';
                            }
                            // publication month
                            let publicationMonth = paperStatements.filter(
                                statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_HAS_PUBLICATION_MONTH
                            );
                            if (publicationMonth.length > 0) {
                                publicationMonth = publicationMonth[0].object.label;
                            } else {
                                publicationMonth = '';
                            }

                            paper.subject.data = {
                                publicationYear,
                                publicationMonth,
                                authorNames: [] // just to hide authors
                            };
                            return paper.subject;
                        });
                    });
                return Promise.all(papers).then(papers => {
                    this.setState({
                        papers: [...this.state.papers, ...papers],
                        isNextPageLoading: false,
                        hasNextPage: papers.length < this.pageSize || papers.length === 0 ? false : true,
                        page: this.state.page + 1
                    });
                });
            } else {
                this.setState({
                    isNextPageLoading: false,
                    hasNextPage: false,
                    isLastPageReached: true
                });
            }
        });
    };

    render() {
        return (
            <>
                {this.state.loading && (
                    <div className="text-center mt-4 mb-4">
                        <Icon icon={faSpinner} spin /> Loading
                    </div>
                )}
                {!this.state.loading && (
                    <div>
                        <Container className="p-0">
                            <h1 className="h4 mt-4 mb-4">Author page: {this.state.author.label}</h1>
                        </Container>
                        <Container className="p-0">
                            <Row>
                                <Col className="col-4">
                                    <div className={'box p-4'}>
                                        <AuthorMetaInfo>
                                            <div className={'key'}>Full name</div>
                                            <div className={'value'}>{this.state.author.label}</div>
                                        </AuthorMetaInfo>
                                        <AuthorMetaInfo>
                                            <div className={'key'}>Date of birth</div>
                                            <div className={'value'}>Date</div>
                                        </AuthorMetaInfo>
                                        <AuthorMetaInfo>
                                            <div className={'key'}>Place of birth</div>
                                            <div className={'value'}>Coutnry</div>
                                        </AuthorMetaInfo>
                                        <AuthorMetaInfo>
                                            <div className={'key'}>Occupation</div>
                                            <div className={'value'}>Lab</div>
                                        </AuthorMetaInfo>
                                    </div>
                                </Col>

                                <Col className="col-8">
                                    <div className={'box p-4 mb-3'}>
                                        <h5>Papers</h5>
                                        {this.state.papers.length > 0 && (
                                            <div>
                                                {this.state.papers.map(resource => {
                                                    return (
                                                        <PaperCard
                                                            paper={{ id: resource.id, title: resource.label, ...resource.data }}
                                                            key={`pc${resource.id}`}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        )}
                                        {!this.state.isNextPageLoading && this.state.hasNextPage && (
                                            <div
                                                style={{ cursor: 'pointer' }}
                                                className="list-group-item list-group-item-action text-center mt-2"
                                                onClick={!this.state.isNextPageLoading ? this.loadMorePapers : undefined}
                                            >
                                                View more papers
                                            </div>
                                        )}
                                    </div>
                                    <div className={'box p-4'}>
                                        <h5>Identifiers</h5>
                                        <Row className="mt-3">
                                            <Col className="col-6">
                                                <AuthorIdentifier>
                                                    <div className={'key'}>ORCID</div>
                                                    <div className={'value'}>ORCID link</div>
                                                </AuthorIdentifier>
                                            </Col>
                                            <Col className="col-6">
                                                <AuthorIdentifier>
                                                    <div className={'key'}>Scopus Author ID</div>
                                                    <div className={'value'}>Scopus link</div>
                                                </AuthorIdentifier>
                                            </Col>
                                            <Col className="col-6">
                                                <AuthorIdentifier>
                                                    <div className={'key'}>Google Scholar author ID</div>
                                                    <div className={'value'}>Google Scholar link</div>
                                                </AuthorIdentifier>
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                )}
            </>
        );
    }
}

AuthorPage.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            authorId: PropTypes.string
        }).isRequired
    }).isRequired
};

export default AuthorPage;