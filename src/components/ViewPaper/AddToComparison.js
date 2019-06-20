import React, { Component } from 'react';
import { CustomInput } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withCookies } from 'react-cookie';
import { compose } from 'redux';
import { addToComparison, removeFromComparison, loadComparisonFromCookie } from '../../actions/viewPaper';

class AddToComparison extends Component {
    componentDidMount() {
        if(this.props.comparison.allIds.length === 0 && this.props.cookies.get('comparison')) { // no comparing values found, sync with cookie
            this.props.loadComparisonFromCookie(this.props.cookies.get('comparison'));
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.comparison !== prevProps.comparison) {
            this.props.cookies.set('comparison', this.props.comparison, { path: '/' });
        }
    }

    toggleCompare = () => {
        const { contributionId, comparison } = this.props;
        
        if (comparison.allIds.includes(contributionId)) {
            this.props.removeFromComparison(contributionId);
        } else {
            this.props.addToComparison({
                contributionId: contributionId,
                contributionData: {
                    paperId: this.props.paperId,
                    paperTitle: this.props.paperTitle,
                    contributionTitle: this.props.contributionTitle,
                }
            });
        }
    }

    render() {
        return (
            <div className="float-right">
                <CustomInput
                    type="checkbox"
                    id={`addToComparsion${this.props.contributionId}`}
                    label="Add to comparison"
                    onChange={this.toggleCompare}
                    checked={this.props.comparison.allIds.includes(this.props.contributionId)}
                />
            </div>
        );
    }
}

AddToComparison.propTypes = {
    contributionId: PropTypes.string.isRequired,
    paperId: PropTypes.string.isRequired,
    paperTitle: PropTypes.string.isRequired,
    contributionTitle: PropTypes.string.isRequired,
    addToComparison: PropTypes.func.isRequired,
    removeFromComparison: PropTypes.func.isRequired,
    loadComparisonFromCookie: PropTypes.func.isRequired,
    comparison: PropTypes.object.isRequired,
    cookies: PropTypes.object,
};

const mapStateToProps = state => ({
    comparison: state.viewPaper.comparison,
});

const mapDispatchToProps = dispatch => ({
    addToComparison: (data) => dispatch(addToComparison(data)),
    removeFromComparison: (data) => dispatch(removeFromComparison(data)),
    loadComparisonFromCookie: (data) => dispatch(loadComparisonFromCookie(data)),
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps
    ),
    withCookies
)(AddToComparison);