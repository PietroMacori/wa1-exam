import { ListGroup } from 'react-bootstrap'
import './App.css';
import Col from "react-bootstrap/Col"
import Button from "react-bootstrap/Button"
import Row from "react-bootstrap/Row"
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Container from "react-bootstrap/Container"

function LeftSideAdmin(props) {
    const [surveys, setSurveys] = useState([]);
    const [active, setActive] = useState(-1);

    useEffect(() => {
        let res;
        //get list of surveys of one admin
        const getSurveys = async () => {
            res = await fetch('/api/' + props.adminID + '/surveys');
            if (res.status === 500) {
                console.log(res.err);
            } else {
                const responseBody = await res.json();
                setSurveys(responseBody);
            }
        }
        //avoid to render if no admin
        if (props.adminID !== undefined && props.adminID !== "-1") {
            getSurveys();

        }
    }, [props.adminID])


    return (
        <>
            <Col sm={4} className="collapse d-sm-block below-nav vheight-100 leftDiv text-center pl-0 pr-0" id="CollapseLeft" >
                <ListGroup variant="flush" className="scrollable-menu mt-1 ml-3 pt-2 pb-2">
                    {surveys ? surveys.map(
                        (x) => {
                            return (<SurveyRow numResp={x.numResp} setPos={props.setPos} setResponse={props.setResponse} setTriggerLeft={props.setTriggerLeft} a={active} setA={setActive} id={x.surveyID} title={x.title} key={x.surveyID} setSurvey={props.setSelectSurvey} setTitle={props.setSelectTitle} />)
                        }) : <></>
                    }
                </ListGroup>
                <Container flex="true" className="mt-4 p-0 m-0 bg-success">
                    <Row className="m-0 p-0 w-100 text-center bg-success" >
                        <Link to="/admin/create" style={{ textDecoration: 'none' }} className="text-white w-100"><Button className="createButton">Create Survey</Button></Link>
                    </Row>
                </Container>
            </Col>

        </>
    );
}

function SurveyRow(props) {
    //set active the correct row
    let active = false;
    if (props.id === props.a) {
        active = true;
    }
    return (<ListGroup.Item action active={active} onClick={() => { props.setPos(0); props.setResponse([]); props.setTriggerLeft((x) => (!x)); props.setA(props.id); props.setSurvey(props.id) }} className="leftButton bg-transparent pt-3 pb-3 text-left"><Row><Col className="text-left" sm={8}><b>{props.title}</b></Col><Col sm={4} className="text-right"><i>Answers: {props.numResp}</i></Col></Row></ListGroup.Item>);

}


export default LeftSideAdmin;
