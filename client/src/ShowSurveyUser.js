import ListGroup from 'react-bootstrap/ListGroup'
import Col from "react-bootstrap/Col"
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Button from 'react-bootstrap/Button'
import Badge from 'react-bootstrap/Badge'
import { Redirect } from 'react-router-dom';

import { useState, useEffect } from 'react';

function ShowSurveyUser(props) {
    const [answers, setAnswers] = useState([]);
    let j = 0;
    const [visible, setVisible] = useState(false)
    const [name, setName] = useState("")
    const [postTrigger, setPostTrigger] = useState();
    const [errorName, setErrorName] = useState();
    const [error, setError] = useState([]);
    const [back, setBack] = useState(false);

    //avoid waarning for using props in useEffecr
    let selectSurvey= props.selectSurvey
    let setResponse= props.setResponse
    
    let handleName = (event) => { setName(event.target.value); };

    useEffect(() => {
        const postResponse = async (send_obj) => {
            const response = await fetch('/api/response/' + postTrigger.selectSurvey, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(send_obj)
            });
            if (response.status === 500) {
                console.log(response.err);
            }
        }

        if (postTrigger) {
            //for each question post a response
            let tmp = [...postTrigger.response]
            for (let i = 0; i < tmp.length; i++) {
                if (tmp[i] !== undefined && tmp[i].response !== undefined) {
                    //filter out all elements with valid = 0 (selected and then deselected)
                    let y = tmp[i].response.filter((x) => (x.valid === 1)).map((x) => (x.value))
                    let z = postTrigger.name;
                    let x = { surveyID: tmp[i].surveyID, questionID: tmp[i].questionID, response: y, userName: z }
                    tmp[i] = x;

                    //and pass from an object to the value
                }

            }

            setPostTrigger(undefined)

            if (postTrigger.checkErrors()) {
                postResponse(tmp);
                setBack(true)
            }
        }
    }, [postTrigger]);

    function checkErrors() {
        let flag = 0;
        if (name === undefined || name.length < 3 || !name.replace(/\s/g, '').length) {
            setErrorName(true);
            flag++;
        }
        else {
            //if now user inserted we can remove the error
            setErrorName(false)
        }


        let t = [...props.response]

        //clean responses undeifned
        for (let i = 0; i < answers.length; i++) {
            if (t[i] === undefined) {
                t[i] = { questionID: answers[i].questionID, surveyID: answers[i].surveyID, response: [] }

            }

        }
        let i = 0;

        let e = [];

        for (let elem of answers) {
            let r = t.filter((x) => (x.questionID === elem.questionID))
            r = r[0]
            if ((r.response === undefined || r.response.filter((x) => (x !== undefined && x.valid === 1)).length === 0 || (elem.open === 1 && r.response[0].value === "")) && elem.min > 0) {
                e[i] = 1;
                flag++;
            }
            else if (r.response.filter((x) => (x !== undefined && x.valid !== 0)).length > elem.max) {
                //error
                e[i] = 1;
                flag++;
            }
            else if (r.response.length < elem.min) {
                //error
                e[i] = 1;
                flag++;
            }
            i++;
        }
        setError(e)
        if (flag === 0)
            return true
        else
            return false
    }



    useEffect(() => {
        let res;
        //get all questions of a given survey
        const getSurveyQuestions = async () => {
            res = await fetch('/api/' + selectSurvey + '/questions');
            if (res.status === 500) {
                console.log(res.err);
            } else if (res.status === 200) {
                const responseBody = await res.json();
                //in db is stored as comma separated list
                cleanData(responseBody);
                //update the answers
                setAnswers(responseBody);
                let t = []
                //init the response of the user -> avoid problems later
                for (let i = 0; i < responseBody.length; i++) {
                    t[i] = { surveyID: selectSurvey, questionID: responseBody[i].questionID, response: [] };
                }
                //update the response
                setResponse(t)
                if (responseBody.length > 0) {
                    setVisible(true)
                }
            }
        }
        getSurveyQuestions();
    }, [selectSurvey, setResponse])

    //converision from db to frontend
    function cleanData(data) {
        for (let elem of data) {
            if (elem !== undefined && elem.answerList !== null) {
                //convert the answers from list of string to array
                let t = elem.answerList.split(',');
                elem.answerList = t;
            }

        }
    }

    //used to go back to list of survey
    if (back) {
        return <Redirect to="/"></Redirect>
    }

    return (
        <Col className=" d-sm-block below-nav vheight-100 bg-white">
            <Row className="m-0 p-0 ml-3 mr-3">
                <Col sm={1} className="text-left mt-2 m-0 p-0 h-100">
                    {<Button size="md" className="btn btn-danger m-0" onClick={() => { setBack(true) }}>Back</Button>}

                </Col>
                <Col sm={10} className="text-center">
                    <h1>{props.selectTitle}</h1>
                </Col>
                <Col sm={1} className="text-right mt-2 m-0 p-0">
                    {visible ? <Button size="md" className="btn btn-success" onClick={() => { setPostTrigger({ name: name, selectSurvey: props.selectSurvey, response: props.response, checkErrors: checkErrors }) }}>Send</Button> : <></>}
                </Col>

            </Row>

            {visible ? <Form className="leftBg mt-1 ml-3 mr-3 pt-2 pb-2">
                <Form.Label><b>Name:</b></Form.Label>
                <Form.Control onChange={handleName} value={name} placeholder="Enter your name" type="text"></Form.Control>
                {errorName ? <Badge pill variant="danger">Error: name smaller that 3 chars</Badge> : <></>}

            </Form> : <></>}

            <ListGroup variant="flush" className=" leftBg mt-1 mr-3 ml-3 pt-2 pb-2">
                {answers.map(
                    (x) => {
                        j++;
                        return (<QuestionRow error={error} surveyID={props.selectSurvey} questionID={x.questionID} response={props.response} setResponse={props.setResponse} answer={x} key={j} pos={j} />)
                    })
                }
            </ListGroup>
        </Col>
    );
}

function QuestionRow(props) {
    let i = 0;

    //manage the OPEN response of a user -> array inside state response
    let handleResponse = i => (event) => {
        let tmp = [...props.response]
        //init to avoid errors
        tmp[i - 1] = { surveyID: props.surveyID, questionID: props.questionID, response: [] };
        tmp[i - 1].response.push({ value: event.target.value, valid: 1 });
        props.setResponse(tmp);

    }

    //manage CLOSED response of a user 
    let handleClose = (i, j, v) => (event) => {
        let tmp = [...props.response]
        let val = 0;
        if (props.response[i - 1] === undefined || props.response[i - 1].response === undefined) {
            tmp[i - 1] = { surveyID: props.surveyID, questionID: props.questionID, response: [] };
        }
        //convert from checked == true/ false to 0/1
        if (event.target.checked) {
            val = 1;
        }
        else {
            val = 0;
        }
        tmp[i - 1].response[j - 1] = { value: v, valid: val }
        //update the state
        props.setResponse(tmp);

    }

    if (props.answer.open === 1) {
        return (
            <Form className="mt-2">
                <Form.Group>
                    <Row>
                        <Col sm={8} ><Form.Label><b>Question:</b> {props.answer.text}</Form.Label></Col>
                        <Col sm={4} className="text-right text-primary"><b>{(props.answer.min ? "Mandatory" : "Optional")} </b></Col>
                    </Row>
                    <Form.Control as="textarea" maxLength="200" placeholder="Answer" value={(props.response && props.response[props.pos - 1] && props.response[props.pos - 1].response[0]) ? props.response[props.pos - 1].response[0].value : ""} rows={2} onChange={handleResponse(props.pos)} />
                    {props.error[props.pos - 1] ? <Badge pill variant="danger">This question is mandatory</Badge> : <></>}

                </Form.Group>
            </Form>
        );
    }
    else {
        return (

            <Form className="mt-2">
                <Form.Group>
                    <Row>
                        <Col sm={8}><Form.Label><b>Question:</b> {props.answer.text}</Form.Label></Col>
                        <Col sm={4} className="text-right text-primary"><b>Min: {props.answer.min} Max: {props.answer.max} </b></Col>
                    </Row>
                    {
                        props.answer.answerList.map((x) => { i++; return (<Form.Check checked={(props.response[props.pos - 1] && props.response[props.pos - 1].response[i - 1]) ? props.response[props.pos - 1].response[i - 1].valid : 0} onChange={handleClose(props.pos, i, x)} type="checkbox" label={x} key={i} />) })
                    }

                    {props.error[props.pos - 1] ? <Badge pill variant="danger">Min and/or max # of answers required</Badge> : <></>}
                </Form.Group>

            </Form>
        );
    }
}

export default ShowSurveyUser;
