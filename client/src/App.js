import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import MyNavBar from './MyNavBar'
import LeftSideUser from './LeftSideUser'
import LeftSideAdmin from './LeftSideAdmin'
import React from 'react';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import { BrowserRouter as Router } from 'react-router-dom';
import { Route } from 'react-router-dom';
import { Switch } from 'react-router-dom';
import ShowSurvey from './ShowSurvey';
import ShowSurveyUser from './ShowSurveyUser';
import CreateSurvey from './CreateSurvey';
import { useState } from 'react';
import Col from "react-bootstrap/Col"
import { LoginForm } from './Login';
import { Redirect } from 'react-router-dom';

function App() {
  const [selectSurvey, setSelectSurvey] = useState("-1");
  const [selectTitle, setSelectTitle] = useState("");
  const [response, setResponse] = useState([]);
  const [responseAdmin, setResponseAdmin] = useState([]);
  const [pos, setPos] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false);
  const [triggerLeft, setTriggerLeft] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [adminID, setAdminID] = useState();
  const [goLogin, setGoLogin] = useState(false);


  const doLogIn = async (credentials) => {
    try {
      await logIn(credentials);
      setLoggedIn(true);
      return (<Redirect to="/admin" />)

    } catch (err) {
      setLoggedIn(false)
    }
  }

  const doLogOut = async () => {
    await logOut();
    setLoggedIn(false);
    return (<Redirect to="/" />)
  }

  async function logIn(credentials) {
    let response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    if (response.ok) {
      //reset the content displayed on the right -> avoid to see content of other users
      setPos(0);
      setSelectSurvey("-1")
      const user = await response.json();
      //set admin
      setAdminID(user.adminID)
      return user.name;
    }
    else {
      setErrorMessage("Invalid username and/or password");
      try {
        const errDetail = await response.json();
        throw errDetail.message;
      }
      catch (err) {
        throw err;
      }
    }
  }

  async function logOut() {
    await fetch('/api/login/current', { method: 'DELETE' });
  }



  return (
    <>
      <Container fluid>
        <Row>
          <Router>
            <Switch>
              <Route exact path="/login" render={() =>
                <>
                  {loggedIn ? <Redirect to="/admin" /> :
                    <React.Fragment>
                      <MyNavBar setResponseAdmin={setResponseAdmin} goLogin={goLogin} setGoLogin={setGoLogin} loggedIn={loggedIn} doLogOut={doLogOut} className="navbar navbar-dark navbar-expand-sm bg-primary p-0 pl-4 fixed-top"></MyNavBar>
                      <LoginForm login={doLogIn} setErrorMessage={setErrorMessage} errorMessage={errorMessage} />
                    </React.Fragment>}
                </>
              } />

              <Route exact path="/admin" render={() =>
                <>
                  {loggedIn ?
                    <React.Fragment>
                      <MyNavBar setResponseAdmin={setResponseAdmin} goLogin={goLogin} setGoLogin={setGoLogin} loggedIn={loggedIn} doLogOut={doLogOut} className="navbar navbar-dark navbar-expand-sm bg-primary p-0 pl-4 fixed-top"></MyNavBar>
                      <LeftSideAdmin adminID={adminID} setPos={setPos} setTriggerLeft={setTriggerLeft} setResponse={setResponseAdmin} setSelectSurvey={setSelectSurvey} setSelectTitle={setSelectTitle}></LeftSideAdmin>
                      <ShowSurvey pos={pos} setPos={setPos} adminID={adminID} response={responseAdmin} setResponse={setResponseAdmin} triggerLeft={triggerLeft} selectSurvey={selectSurvey} selectTitle={selectTitle} answers={[]} />
                    </React.Fragment>
                    : <Redirect to="/login" />
                  }
                </>
              } />

              <Route exact path="/admin/create" render={() =>
                <>{loggedIn ?
                  <React.Fragment>
                    <MyNavBar setResponseAdmin={setResponseAdmin} goLogin={goLogin} setGoLogin={setGoLogin} loggedIn={loggedIn} doLogOut={doLogOut} className="navbar navbar-dark navbar-expand-sm bg-primary p-0 pl-4 fixed-top"></MyNavBar>
                    <CreateSurvey setResponseAdmin={setResponseAdmin} adminID={adminID} setPos={setPos} setSelectSurvey={setSelectSurvey} />
                  </React.Fragment>
                  : <Redirect to="/login" />
                }
                </>
              } />
              <Route exact path="/" render={() =>
                <>
                  <MyNavBar setResponseAdmin={setResponseAdmin} goLogin={goLogin} setGoLogin={setGoLogin} loggedIn={loggedIn} doLogOut={doLogOut} className="navbar navbar-dark navbar-expand-sm bg-primary p-0 pl-4 fixed-top"></MyNavBar>
                  <LeftSideUser selectSurvey={selectSurvey} setResponse={setResponse} setSelectSurvey={setSelectSurvey} setSelectTitle={setSelectTitle}></LeftSideUser>
                  <Col className=" d-sm-block below-nav vheight-100 bg-white text-center align-text-middle"><h1>Welcome to SurveyManager</h1><h4>Select one survey and start answering!</h4></Col>
                </>
              } />

              <Route path="/survey" render={() => <>
                <MyNavBar setResponseAdmin={setResponseAdmin} goLogin={goLogin} setGoLogin={setGoLogin} loggedIn={loggedIn} doLogOut={doLogOut} className="navbar navbar-dark navbar-expand-sm bg-primary p-0 pl-4 fixed-top"></MyNavBar>
                <ShowSurveyUser response={response} setResponse={setResponse} selectSurvey={selectSurvey} selectTitle={selectTitle}></ShowSurveyUser>
              </>} />


              <Route path="/" render={() =>
                <>
                  <MyNavBar setResponseAdmin={setResponseAdmin} goLogin={goLogin} setGoLogin={setGoLogin} loggedIn={loggedIn} doLogOut={doLogOut} className="navbar navbar-dark navbar-expand-sm bg-primary p-0 pl-4 fixed-top"></MyNavBar>
                  <LeftSideUser setResponse={setResponse} selectSurvey={selectSurvey} setSelectSurvey={setSelectSurvey} setSelectTitle={setSelectTitle}></LeftSideUser>
                  <Col className=" d-sm-block below-nav vheight-100 bg-white text-center align-text-middle"><h1>Welcome to the SurveyManager</h1><h4>Select one survey and start answering!</h4></Col>
                </>
              } />
            </Switch>
          </Router>
        </Row>
      </Container>

    </>
  );
}

export default App;
