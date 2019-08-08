import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import { renderToString } from 'react-dom/server';

const Check = styled.span`
    color: #329A0C;
    font-size:18px;
`;

const Cross = styled.span`
    color: #F02500;
    font-size:20px;
`;

class Boolean extends Component {
    constructor(props) {
        super(props);

        this.trueValues = ['t', 'y', 'true'];
        this.falseValues = ['f', 'n', 'false'];
        this.supportedValues = [...this.trueValues, ...this.falseValues];
    }

    render() {
        const label = this.props.children;
        const labelToText = renderToString(label);

        if (!labelToText) {
            return '';
        }

        // if label value is not supported, return the regular item
        if (this.supportedValues.indexOf(labelToText.toLowerCase()) === -1) {
            return label;
        }

        if (this.trueValues.indexOf(labelToText.toLowerCase()) !== -1) {
            return (
                <Check>
                    <Icon icon={faCheck} />
                </Check>
            );
        } else if (this.falseValues.indexOf(labelToText.toLowerCase()) !== -1) {
            return (
                <Cross>
                    <Icon icon={faTimes} />
                </Cross>
            );
        } else {
            return label;
        }
    }
}

Boolean.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]).isRequired,
};


export default Boolean;