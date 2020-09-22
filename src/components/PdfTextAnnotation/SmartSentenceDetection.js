import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { CustomInput } from 'reactstrap';
import Tippy from '@tippy.js/react';
import { summarizeText } from 'network';
import { SentenceTokenizer } from 'natural';
import { createGlobalStyle } from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { setShowHighlights as setShowHighlightsAction, setSummaryFetched as setSummaryFetchedAction } from 'actions/pdfTextAnnotation';

const ANNOTATION_RATIO = 0.08;
const PROCESSING_SECONDS_PER_PAGE = 15;

const Container = styled.div`
    // for showing a loading progress estimator background
    &:before {
        background: #a8acbd;
        top: 0;
        left: 0;
        content: '';
        position: absolute;
        height: 100%;
        width: ${props => (props.isLoading ? 100 : 0)}%;
        border-radius: 4px 0 0 4px;
        z-index: -1;
        transition: width ${props => props.estimatedLoadingTime}s;
        visibility: ${props => (props.isLoading ? 'visible' : 'hidden')};
    }
    border-radius: 4px;
    background: #b6bacb;
    padding: 10px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 1;
    overflow: hidden;
`;

/**
 * Global style to set the highlight color of the PDF.js highlights
 * In case the highlights should be hidden, set the cursor to default and the color to transparent
 */
const GlobalStyle = createGlobalStyle`
    .highlight { 
        cursor: ${props => (props.showHighlights ? 'pointer' : 'text')}!important;
        background: ${props => (props.showHighlights ? '#d2d5df' : 'transparent')}!important;
    }
`;

const SmartSentenceDetection = props => {
    const [isLoading, setIsLoading] = useState(false);
    const showHighlights = useSelector(state => state.pdfTextAnnotation.showHighlights);
    const summaryFetched = useSelector(state => state.pdfTextAnnotation.summaryFetched);
    const pdfViewer = useSelector(state => state.pdfTextAnnotation.pdfViewer);
    const pdf = useSelector(state => state.pdfTextAnnotation.pdf);
    const dispatch = useDispatch();
    const setShowHighlights = useCallback(show => dispatch(setShowHighlightsAction(show)), [dispatch]);

    /**
     * Selects text between beginNode and endNode
     */
    const selectText = useCallback((beginNode, endNode) => {
        const sel = window.getSelection();
        const range = document.createRange();
        const endOffset = endNode.childNodes.length;
        range.setStart(beginNode, 0);
        range.setEnd(endNode, endOffset);
        sel.removeAllRanges();
        sel.addRange(range);
    }, []);

    /**
     * Make an array of all annotated sentences across multiple lines
     * each sentence is an object with "begin", "middle" and "end" node
     * and the range can be selected based on the start and end node
     * @return {Array} array of sentence objects
     **/
    const getFullSentences = useCallback(() => {
        const highlights = document.getElementsByClassName('highlight');
        const sentences = [];
        let sentenceIndex = 0;

        for (const highlight of highlights) {
            if (highlight.classList.contains('begin')) {
                sentences.push({
                    begin: highlight
                });
            } else if (highlight.classList.contains('middle')) {
                if (!sentences[sentenceIndex].middle) {
                    sentences[sentenceIndex].middle = [];
                }
                sentences[sentenceIndex].middle.push(highlight);
            } else if (highlight.classList.contains('end')) {
                sentences[sentenceIndex].end = highlight;
                sentenceIndex++;
            }
        }

        return sentences;
    }, []);

    /**
     * Handles a click in pdfContainer, ensures highlights within the PDF are clickable
     * useCallback is required to ensure the event can be removed later via removeEventListener
     **/
    const handleContainerClick = useCallback(
        e => {
            // only proceed if the target is a highlight
            if (!e.target.classList.contains('highlight')) {
                return;
            }

            const sentences = getFullSentences();

            // now loop through the sentences and find the node that is clicked
            // based on that node, at the begin and end node for this sentence
            let beginNode = null;
            let endNode = null;
            for (const sentence of sentences) {
                if (sentence.begin === e.target || sentence.end === e.target || (sentence.middle && sentence.middle.includes(e.target))) {
                    beginNode = sentence.begin;
                    endNode = sentence.end;
                }
            }

            // make a text selected with beginNode and endNode
            selectText(beginNode, endNode);
        },
        [getFullSentences, selectText]
    );

    // binds the click event to the container, updates when highlights are shown/hidden
    useEffect(() => {
        // bind onclick event to container, used when highlights are clicked
        if (pdfViewer && pdfViewer.container) {
            pdfViewer.container.removeEventListener('click', handleContainerClick);

            if (showHighlights) {
                pdfViewer.container.addEventListener('click', handleContainerClick);
            }
        }
    }, [pdfViewer, showHighlights, handleContainerClick]);

    // effect runs when the highlights should be loaded (when the PDF is ready)
    useEffect(() => {
        // don't continue if is fetched already, or if the viewer isn't ready yet
        if (summaryFetched || !pdfViewer || isLoading || !pdf) {
            return;
        }

        const setSummaryFetched = fetched => dispatch(setSummaryFetchedAction(fetched));

        const getAllText = () => {
            const maxPages = pdfViewer.pagesCount;
            const countPromises = []; // collecting all page promises
            for (let j = 1; j <= maxPages; j++) {
                const page = pdfViewer.pdfDocument.getPage(j);

                countPromises.push(
                    page.then(function(page) {
                        // add page promise
                        const textContent = page.getTextContent();
                        return textContent.then(function(text) {
                            // return content promise
                            return text.items
                                .map(function(s) {
                                    return s.str;
                                })
                                .join(''); // value page text
                        });
                    })
                );
            }
            // Wait for all pages and join text
            return Promise.all(countPromises).then(function(texts) {
                return texts.join('');
            });
        };

        const highlightText = () => {
            setIsLoading(true);
            setShowHighlights(true);

            getAllText()
                .then(async text => {
                    return summarizeText({
                        text,
                        ratio: ANNOTATION_RATIO
                    });
                })
                .then(({ summary }) => {
                    const tokenizer = new SentenceTokenizer();
                    const summarySentences = tokenizer.tokenize(summary);

                    pdfViewer.findController.executeCommand('find', {
                        query: summarySentences,
                        caseSensitive: false,
                        highlightAll: true,
                        findPrevious: true,
                        phraseSearch: true
                    });

                    setSummaryFetched(true);
                    setIsLoading(false);
                })
                .catch(e => {
                    setSummaryFetched(false);
                    setIsLoading(false);
                });
        };

        highlightText();
    }, [pdfViewer, showHighlights, summaryFetched, isLoading, pdf, setShowHighlights, dispatch]);

    return (
        <Container className="mb-5" isLoading={isLoading} estimatedLoadingTime={PROCESSING_SECONDS_PER_PAGE}>
            <Tippy content="Automatically highlight sentences that are potentially useful for annotation" placement="bottom">
                <span>Smart sentence detection</span>
            </Tippy>

            {!isLoading ? (
                <CustomInput
                    type="switch"
                    id="enableSentenceDetection"
                    onChange={e => setShowHighlights(e.target.checked)}
                    checked={showHighlights}
                    disabled={!pdf}
                />
            ) : (
                <Icon icon={faSpinner} spin />
            )}

            <GlobalStyle showHighlights={showHighlights} />
        </Container>
    );
};

export default SmartSentenceDetection;
