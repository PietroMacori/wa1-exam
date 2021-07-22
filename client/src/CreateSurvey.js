import ListGroup from 'react-bootstrap/ListGroup'
import Col from "react-bootstrap/Col"
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import Badge from 'react-bootstrap/Badge'

import Container from 'react-bootstrap/Container'

function CreateSurvey(props) {
    const [show, setShow] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [postTrigger, setPostTrigger] = useState();
    const handleShow = () => { setShow(true) };
    const [surveyTitle, setSurveyTitle] = useState("");
    const [redirectTo, setRedirctTo] = useState(false);
    const [errorTitle, setErrorTitle] = useState(false);
    const [errorQuestions, setErrorQuestions] = useState(false);
    const handleTitle = (event) => { setSurveyTitle(event.target.value); };

    //tmp copies of props setState to avoid warning in the useEffect
    let setSelectSurvey = props.setSelectSurvey;
    let setResponseAdmin = props.setResponseAdmin
    let setPos = props.setPos
    let i = -1;

    useEffect(() => {
        //insert survey with the list of questions
        const postSurvey = async () => {
            const response = await fetch('/api/' + postTrigger.adminID + '/survey', {
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
        //set up the data to be send by the post
        let send_obj;

        if (postTrigger) {
            send_obj = {
                //informations coming from the trigger itself (setted in checkFields)
                title: postTrigger.surveyTitle,
                listQuestions: postTrigger.questions
            };
            postSurvey().then(() => { setSelectSurvey("-1"); setResponseAdmin([]); setPos(undefined); setRedirctTo(true) });
        }
    }, [postTrigger, setPos, setResponseAdmin, setSelectSurvey]);

    //if post is successfull then redirect to main page
    if (redirectTo) {
        return (<Redirect to='/admin'></Redirect>);
    }


    function checkFields() {
        let flag = 0;
        setErrorTitle(false)
        setErrorQuestions(false)

        //check lenght of the title
        if (surveyTitle.length === 0) {
            flag = 1;
            setErrorTitle(true)
        }
        //check if at least on question is present
        if (questions.length === 0) {
            flag = 1;
            setErrorQuestions(true)
        }
        //If no title or no questions then dont send the post
        if (flag === 1) {
            return;
        }
        //after I checked that it's all correct I can trigger the post
        setPostTrigger({ surveyTitle: surveyTitle, questions: questions, adminID: props.adminID })

    }

    return (

        <Col className="collapse d-sm-block ml-3 mr-3 below-nav vheight-100">
            <Row>
                <Col sm={2}><Button size="md" className="btn btn-danger" onClick={() => { setSelectSurvey("-1"); setResponseAdmin([]); setPos(undefined); setRedirctTo(true) }}>
                    Back
                </Button></Col>
                <Col sm={8} className="text-center">
                    <h2><b>Create Survey</b></h2>
                </Col>
                <Col sm={2} className="text-right">
                    <Button size="md" className="btn btn-success " onClick={() => { checkFields() }}>
                        Publish
                    </Button>
                </Col>
            </Row>
            <br></br>

            <Form>
                <Form.Group>
                    <Row>
                        <Col sm={1} className="align-middle " >
                            <Form.Label className="w-100 mt-1" ><h4>Title:</h4></Form.Label>
                        </Col>
                        <Col sm={8} className="text-left ml-0 pl-0">
                            <Form.Control className="w-50" onChange={handleTitle} value={surveyTitle} type="text" placeholder="Enter survey's title"></Form.Control>
                            {errorTitle ? <Form.Label className="text-danger mt-1"><b>Error: title must be non empty</b></Form.Label> : <></>}
                        </Col>
                    </Row>
                </Form.Group>
            </Form>

            <h4>Questions:</h4>
            {errorQuestions ? <Container className="m-0 text-danger p-0"><b><p>Error: cannot have zero questions</p></b></Container> : <></>}
            <ListGroup variant="flush" className=" leftBg mt-1 ml-3 pt-2 pb-2">
                {questions.map(
                    (x) => {
                        i++;
                        return (<QuestionRow setAllQuestions={setQuestions} allQuestions={questions} question={x} max={questions.length} pos={i} key={i} />)
                    })
                }
                <Container className="text-right mr-0 pr-0"> <Button className="btn btn-lg btn-primary fixed-right-bottom" onClick={handleShow}>&#43;</Button>
                </Container>
                <CreateQuestionModal show={show} setShow={setShow} questions={questions} setQuestions={setQuestions}></CreateQuestionModal>

            </ListGroup>
        </Col>

    );
}


function QuestionRow(props) {
    function deleteQuestion() {
        //copy the state containg the questions
        let tmp = [...props.allQuestions]
        //remove the one in the current position
        tmp.splice(props.pos, 1);
        //reset back
        props.setAllQuestions(tmp);
    }

    function up(dir) {
        //copy questions
        let tmp = [...props.allQuestions]
        //switch
        let a = tmp[props.pos];
        let b = tmp[props.pos - dir];
        tmp[props.pos] = b;
        tmp[props.pos - dir] = a;
        //set back
        props.setAllQuestions(tmp);
    }
    return (<ListGroup.Item className=" bg-transparent p-1">
        <Form>
            <Row>
                <Col sm={8}>
                    <Form.Label>{props.question.text}</Form.Label>
                </Col>
                <Col sm={4} className="text-right">
                    {
                        props.pos >= 1 ? <><Button variant="link" className="p-0 m-0 text-dark" onClick={() => { up(+1) }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-up-circle customIcon" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V11.5z" />
                            </svg>
                        </Button></> : <></>
                    }
                    {
                        props.pos !== props.max - 1 ? <>
                            <Button variant="link" className="p-0 m-0 text-dark" onClick={() => { up(-1) }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-arrow-down-circle customIcon" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z" />
                                </svg>
                            </Button></> : <></>}
                    <Button variant="link" className="p-0 m-0 text-dark" onClick={() => { deleteQuestion() }}>
                        <svg className="bi bi-trash customIcon" width="20" height="20" viewBox="0 0 16 16" fill="red" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z" />
                            <path fillRule="evenodd" d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" clipRule="evenodd" />
                        </svg>
                    </Button>
                </Col>
            </Row>
        </Form>
    </ListGroup.Item>);
}


function CreateQuestionModal(props) {
    const [titleQuestion, setTitleQuestion] = useState("");
    const [answers, setAnswers] = useState([]);
    const [min, setMin] = useState();
    const [max, setMax] = useState();
    const [open, setOpen] = useState(1);
    const [optional, setOptional] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");


    function addQuestion() {
        let flag = 0;
        let tmp_error = []
        let tmp_min = min;
        let tmp_max = max;
        //in case the user doenst click on the button we must anyway set the correct value to the min and max
        if (open === 1 && optional === true) {
            tmp_min = 0;
            tmp_max = 1;
            setMin(tmp_min)
            setMax(tmp_max)
        }

        else if (open === 1 && optional === false) {
            tmp_min = 1;
            tmp_max = 1;
            setMin(tmp_min)
            setMax(tmp_max)
        }

        //check min and max in case the question is closed
        if (open === 0 && (tmp_min === undefined || tmp_max === undefined || tmp_min.toString().match(/^[0-9]+$/) == null || tmp_max.toString().match(/^[0-9]+$/) == null)) {
            tmp_error[0] = "Min and Max must be numbers"
            flag = 1;
        }
        else if (tmp_min > tmp_max) {
            tmp_error[1] = "Min bigger than max";
            flag = 1;
        }

        //chekc that title has been inserted
        if (titleQuestion === undefined || titleQuestion.length === 0) {
            tmp_error[2] = "No text for the question"
            flag = 1;
        }
        //check at least one possible answer
        if ((answers === undefined || answers.length === 0) && open === 0) {
            tmp_error[3] = "No answers for the question"
            flag = 1;
        }
        
        else {
            for (let elem of answers) {
                if (elem === undefined || elem === '') {
                    tmp_error[4] = "At least one answer is empty"
                    flag = 1;
                    break;
                }
            }
        }
        for (let elem1 of answers) {
            let list = answers.filter((x) => (x === elem1))
            if (list.length > 1) {
                tmp_error[5] = "One answer is repeated"
                flag = 1;
            }

        }

        if (!open && tmp_max > answers.length) {
            tmp_error[6] = "Max bigger than # of answers"
            flag = 1;
        }
        if (!open && tmp_min > answers.length) {
            tmp_error[7] = "Min bigger than # of answers"
            flag = 1;
        }
        console.log(tmp_max)
        if (!open && tmp_max === "0") {
            tmp_error[8] = "Max must be bigger than 0"
            flag = 1;
        }
        //if an error occurred then display the error
        if (flag) {
            setErrorMessage(tmp_error)
            return
        }
        //IF HERE BECAUSE NO ERRORS
        //create a variable containng the values for the question
        let newQuestion = {
            text: titleQuestion,
            open: open,
            max: tmp_max,
            min: tmp_min,
            answerList: [...answers] //here the list of possible answers is saved
        }

        //update the question state
        let tmp = [...props.questions]
        tmp.push(newQuestion);
        props.setQuestions(tmp);
        //we can close the modal
        handleCloseWin();
    }

    //close the modal and reset all error / values
    let handleCloseWin = () => { props.setShow(false); setOpen(1); setTitleQuestion(""); setAnswers([]); setMax(); setMin(); setOptional(false); setErrorMessage("") };
    const handleTitleQuestion = (event) => { setTitleQuestion(event.target.value) };
    const handleMin = (event) => { setMin(event.target.value); };
    const handleMax = (event) => { setMax(event.target.value); };
    const handleOpen = (event) => { setOpen(() => (event.target.value === "Open" ? 1 : 0)) };


    return (
        <Modal show={props.show} className="p-4">
            <Container className="text-center"><br></br><h3>Create Question</h3></Container>
            <Row></Row>
            <Form className="p-4">
                <Form.Group>
                    <Form.Label className="mr-1">Question: </Form.Label>
                    <Form.Control type="text" size="sm" className="w-100" placeholder="Insert question" onChange={handleTitleQuestion} value={titleQuestion}></Form.Control>
                </Form.Group>
                <Form.Group>
                    <Form.Label className="mr-1">Open/closed: </Form.Label>
                    <Form.Control as="select" size="sm" className="w-100" value={open ? "Open" : "Closed"} onChange={handleOpen}>
                        <option>
                            Open
                        </option>
                        <option>
                            Closed
                        </option>
                    </Form.Control>
                </Form.Group>
                <Form.Group>
                    <OpenClose questionNum={props.questionNum} open={open} max={max} min={min} setMin={setMin} setMax={setMax} handleMin={handleMin} handleMax={handleMax} questions={props.questions} answers={answers} setQuestions={props.setQuestions} setAnswers={setAnswers} optional={optional} setOptional={setOptional}></OpenClose>
                </Form.Group>
            </Form>
            <hr className="bigHr mt-0"></hr>
            <Container className="text-danger text-center">
                {errorMessage ?
                    errorMessage.map((x) => { return (<Badge key={x} pill variant="danger">{x}</Badge>) }) : <></>
                }
            </Container>
            <Row className="mb-2">

                <Col sm={6} className="text-center">
                    <Button className="btn btn-lg btn-danger m-2 p-1 w-50" onClick={handleCloseWin}>Close</Button>

                </Col >
                <Col sm={6} className="text-center">
                    <Button className="btn btn-lg btn-success m-2 p-1 w-50" onClick={() => { addQuestion(); }}>Confirm</Button>
                </Col>
            </Row>
        </Modal>
    );
}


function OpenClose(props) {
    let i = 0;

    //function that allows to correctly display the input forms
    function addElement() {
        let tmp = [...props.answers];
        tmp.push("");
        props.setAnswers(tmp);
    }

    //manage the events of a variable # on input form using the answer state
    let handleQuestionAnswers = i => (event) => {
        let tmp = [...props.answers]
        tmp[i - 1] = event.target.value;
        props.setAnswers(tmp);
    }

    //value of checkbox works in true and false, while I need 0 and 1
    let handleOptional = async () => {
        if (props.optional === true) {
            props.setOptional(false);
            props.setMin(1);
            props.setMax(1);
        }
        else {
            props.setOptional(true);
            props.setMin(0);
            props.setMax(1);
        }
    }

    if (props.open === 0) {
        return (
            <>
                <Form.Group>
                    <Form.Label className="mr-1 p-0">Min # answer</Form.Label>
                    <Form.Control type="text" size="sm" className="w-25" onChange={props.handleMin}></Form.Control>
                </Form.Group>
                <Form.Group>
                    <Form.Label className="mr-1 p-0">Max # answer </Form.Label>

                    <Form.Control type="text" size="sm" className="w-25" onChange={props.handleMax}></Form.Control>

                </Form.Group>
                <Container className="scrollable-list m-0  p-0 text-right">
                    <ListGroup variant="flush" className=" leftBg mt-1" >
                        {props.answers.map(
                            (x) => {
                                i++;
                                return (<Form.Control key={i} onChange={handleQuestionAnswers(i)} value={props.answers[i - 1]} placeholder={"Answer" + i} className="mb-1" type="text" size="sm"></Form.Control>)
                            })
                        }
                    </ListGroup>
                    <Button className="btn btn-sm mt-2" onClick={() => { addElement() }}>Add Answer</Button>
                </Container>

            </>
        );
    }
    else {
        return (<Form.Check onChange={handleOptional} value={props.optional} type="checkbox" label="Optional" />);
    }
}


export default CreateSurvey;
