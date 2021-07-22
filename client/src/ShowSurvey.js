import ListGroup from 'react-bootstrap/ListGroup'
import Col from "react-bootstrap/Col"
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Button from 'react-bootstrap/Button'
import { useState, useEffect } from 'react';

import Container from 'react-bootstrap/Container'
function ShowSurvey(props) {
    const [users, setUsers] = useState();
    const [triggerUserRes, setTriggerUserRes] = useState(false);

    useEffect(() => {
        let res;
        const getUsers = async () => {
            res = await fetch('/api/' + props.selectSurvey + '/users');
            if (res.status === 500) {
                console.log(res.err);
            } else {
                const responseBody = await res.json();
                if (responseBody !== undefined && responseBody.length !== 0) {
                    setUsers(responseBody)
                    setTriggerUserRes({ selectSurvey: props.selectSurvey, users: responseBody, adminID: props.adminID, pos: props.pos, setResponse: props.setResponse })
                }
                else {
                    //the current survey has not responses. Avoid to display responses from other surveys
                    setUsers([])
                }

            }

        }
        if (props.selectSurvey !== -1)
            getUsers();

    }, [props.triggerLeft, props.selectSurvey, props.pos, props.adminID, props.setResponse])


    useEffect(() => {
        let res;
        //get all responses of a given survey of a given admin of a given user
        const getResponse = async () => {
            res = await fetch('/api/' + triggerUserRes.adminID + '/' + triggerUserRes.selectSurvey + '/' + triggerUserRes.users[triggerUserRes.pos].userID);
            if (res.status === 500) {
                console.log(res.err);
            } else {
                const responseBody = await res.json();
                //clean the result -> split the comma separated closed responses
                triggerUserRes.setResponse(responseBody)
            }
        }
        if (triggerUserRes && parseInt(triggerUserRes.selectSurvey) !== -1 && triggerUserRes.users !== undefined)
            getResponse();
    }, [triggerUserRes])


    return (

        <Col className="collapse d-sm-block below-nav vheight-100">
            <Container className="w-100">
                <Row className="w-100 m-0 p-0">
                    <Col sm={1} className="text-left pl-0">
                        {(props.pos > 0 && users) ?
                            <Button variant="link" className="p-0 m-0 text-dark" onClick={() => { props.setPos((pos) => (pos - 1)); setTriggerUserRes({ adminID: props.adminID, selectSurvey: props.selectSurvey, pos: props.pos, users: users, setResponse: props.setResponse }) }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="currentColor" className="bi bi-arrow-left-circle" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5z" />
                                </svg>
                            </Button> : <></>}
                    </Col>
                    <Col sm={10} className="text-center">
                        <h3>{(props.response && props.response[0]) ? props.response[0].userName : ""}</h3>
                    </Col>

                    <Col sm={1} className="text-right pr-0">
                        {(users && props.pos < users.length - 1) ? <Button variant="link" className="p-0 m-0 text-dark" onClick={() => { props.setPos((pos) => (pos + 1)); setTriggerUserRes({ adminID: props.adminID, selectSurvey: props.selectSurvey, pos: props.pos, users: users, setResponse: props.setResponse }) }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="currentColor" className="bi bi-arrow-right-circle" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z" />
                            </svg>
                        </Button> : <></>}
                    </Col>
                </Row>



            </Container>

            <ListGroup variant="flush" className=" leftBg mt-1 ml-3 mr-3 pt-2 pb-2">
                {props.response ? props.response.map(
                    (x) => {
                        return (<QuestionRow allAnswers={props.response} answer={x} key={x.responseID} />)
                    }) : <></>
                }
            </ListGroup>
        </Col>
    );
}

function QuestionRow(props) {
    //dislay different things depending if open or closed question
    if (props.answer.open === 1) {
        return (<ListGroup.Item className=" bg-transparent p-1">
            <Form>
                <Form.Group>
                    <Form.Label><b>Question:</b> {props.answer.question}</Form.Label>
                    <Form.Control as="textarea" readOnly value={props.answer.response} rows={3} />
                </Form.Group>
            </Form>
        </ListGroup.Item>);
    }
    else {
        return (
            <Form>
                <Form.Group>
                    <Form.Label><b>Question:</b> {props.answer.question}</Form.Label>
                    {
                        props.answer.response.split(',').map((x) => { return ((x !== "") ? <Form.Check key={x} type="checkbox" label={x} checked={1} readOnly /> : <p key={x}><i>No answers for this question</i></p>) })
                    }
                </Form.Group>

            </Form>
        );
    }
}

export default ShowSurvey;
