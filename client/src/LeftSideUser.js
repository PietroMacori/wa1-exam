import { ListGroup } from 'react-bootstrap'
import './App.css';
import Col from "react-bootstrap/Col"
import { Redirect } from 'react-router-dom';

import { useState, useEffect } from 'react';


function LeftSideUser(props) {
    const [surveys, setSurveys] = useState([]);
    const [redirectTo, setRedirectTo] = useState(false);

    useEffect(() => {
        let res;
        //get all surveys
        const getSurveys = async () => {
            res = await fetch('/api/surveys');
            if (res.status === 500) {
                console.log(res.err);
            } else {
                const responseBody = await res.json();
                setSurveys(responseBody);
            }

        }
        getSurveys();
    }, [])

    //go to the selected survey
    if (redirectTo) {
        let dest = '/survey/' + props.selectSurvey
        return <Redirect to={dest} />
    }

    return (
        <>
            <Col sm={5} className="collapse d-sm-block below-nav vheight-100 leftDiv text-center pl-0" id="CollapseLeft" >
                <ListGroup variant="flush" className=" scrollable-menu-user mt-1 ml-3 pt-2 pb-2">
                    {surveys.map(
                        (x) => {
                            return (<SurveyRow setRed={setRedirectTo} setResponse={props.setResponse} title={x.title} id={x.surveyID} key={x.surveyID} setSurvey={props.setSelectSurvey} setTitle={props.setSelectTitle} />)
                        })}
                </ListGroup>

            </Col>

        </>
    );
}

function SurveyRow(props) {
    //when a survey is selected, many properties are setted and passed to the right side of the screen 
    return (<ListGroup.Item action onClick={() => { props.setResponse(""); props.setTitle(props.title); props.setSurvey(props.id); props.setRed(true) }} className="leftButton bg-transparent p-3 text-left"><h6>{props.title}</h6></ListGroup.Item>);
}


export default LeftSideUser;
