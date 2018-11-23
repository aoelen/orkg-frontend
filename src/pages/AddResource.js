import React, {Component} from 'react';
import {
    createLiteralStatement,
    createPredicate,
    createResource,
    crossrefUrl,
    getPredicatesByLabel,
    submitGetRequest
} from '../network';
import {NotificationManager} from 'react-notifications';
import './AddResource.css';
import {doiPredicateLabel} from '../utils';

export default class AddResource extends Component {
    state = {
        value: '',
        /* Possible values: 'edit', 'loading'. */
        editorState: 'edit',
    };

    doi = null;

    setEditorState = (editorState) => {
        this.setState({editorState: editorState});
    };

    handleAdd = async () => {
        this.setEditorState('loading');
        const doiRegex = /\b(10[.][0-9]{4,}(?:[.][0-9]+)*\/(?:(?!["&'<>])\S)+)\b/g;
        if (!doiRegex.test(this.state.value)) {
            await this.createResource(false);
        } else {
            this.doi = this.state.value;
            await this.createResourceUsingDoi();
        }
    };

    createResourceUsingDoi = async () => {
        try {
            const responseJson = await submitGetRequest(crossrefUrl + this.state.value);
            this.setState({value: responseJson.message.title[0]});
            await this.createResource(true);
        } catch (error) {
            console.error(error);
            NotificationManager.error(error.message, 'Error finding DOI', 5000);
            this.setEditorState('edit');
        }
    };

    handleInput = (event) => {
        this.setState({value: event.target.value.trim()});
    };

    handleKeyUp = async (event) => {
        event.preventDefault();
        if (event.keyCode === 13) {
            await this.handleAdd();
        }
    };

    handleLiteralStatementCreationError = (error) => {
        console.error(error);
        NotificationManager.error(error.message, 'Error creating literal statement', 5000);
    };

    createResource = async (usingDoi) => {
        const value = this.state.value;
        if (value && value.length !== 0) {
            try {
                const responseJson = await createResource(value);
                const resourceId = responseJson.id;

                if (usingDoi) {
                    await this.createDoiStatement(resourceId);
                } else {
                    this.navigateToResource(resourceId);
                }
            } catch (error) {
                this.setEditorState('edit');
                console.error(error);
                NotificationManager.error(error.message, 'Error creating resource', 5000);
            }
        }
    };

    navigateToResource = (resourceId) => {
        this.setEditorState('edit');
        document.location.href = `${process.env.PUBLIC_URL}/resource/${resourceId}`;
    };

    createLiteralStatement = (resourceId, predicateId) => {
        createLiteralStatement(resourceId, predicateId, this.doi,
                () => this.navigateToResource(resourceId), this.handleLiteralStatementCreationError);
    };

    createDoiStatement = async (resourceId) => {
        try {
            const responseJson1 = await getPredicatesByLabel(doiPredicateLabel);
            const doiPredicate = responseJson1.find((item) => item.label === doiPredicateLabel);
            if (!doiPredicate) {
                try {
                    const responseJson2 = await createPredicate(doiPredicateLabel);
                    await this.createLiteralStatement(resourceId, responseJson2.id);
                } catch (error) {
                    this.setEditorState('edit');
                    console.error(error);
                    NotificationManager.error(error.message, 'Error creating predicate', 5000);
                }
            } else {
                this.createLiteralStatement(resourceId, doiPredicate.id);
            }
        } catch (error) {
            console.error(error);
            NotificationManager.error(error.message, 'Error finding predicates', 5000);
            this.setEditorState('edit');
        }
    };

    render() {
        const loading = this.state.editorState === 'loading';
        return <div className="input-group mb-3">
            <input type="text" className="form-control" placeholder="Research contribution title or DOI"
                    disabled={loading}
                    onInput={this.handleInput}
                    onKeyUp={this.handleKeyUp}
                    aria-label="Resource title or DOI" aria-describedby="basic-addon2"/>
            {
                !loading ? <div className="input-group-append">
                        <button className="btn btn-outline-primary" type="button" onClick={this.handleAdd}>Add</button>
                    </div>
                    : <div className="container vertical-centered">
                        <span className="fa fa-spinner fa-spin"/>
                    </div>
            }
        </div>
    }

}
