import { Form, Button, Alert, Col, Row, Container } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import './App.css';


function validateCredentials(username, password) {
  //regex to recognize a email
  const reUsername = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  //password must be at least 4 elemenets long
  const rePassword = /(?=.{4,15})/;
  if (!reUsername.test(username) || !rePassword.test(password)) {
    return false;
  }
  return true;
}


function LoginForm(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [goBack, setGoBack] = useState(false);
  //used to avoid warning in the use effect
  const setE = props.setErrorMessage

  //Clear previous errors from login
  useEffect(() => {
    setE('')
  }, [setE])


  const handleSubmit = (event) => {
    let valid = true;
    event.preventDefault();
    const credentials = { username, password };
    valid = validateCredentials(username, password);
    //check if input is valid
    if (valid) {
      //try the login now
      props.login(credentials);
    }
    else {
      //display error
      props.setErrorMessage('Format not valid')
    }
  };

  //used to go back if login is aborted
  if (goBack) {
    return (<Redirect to="/"></Redirect>)
  }


  return (
    <Row className="w-100 mt-5 vheight-100">
      <Col sm={3}></Col>
      <Col sm={6} className='col-5 below-nav'>
        <Container className=" p-5">
          <Form>
            {props.errorMessage ? <Alert variant='danger'>{props.errorMessage}</Alert> : ''}
            <Form.Group controlId='username'>
              <Form.Label size="lg"><b>Email</b></Form.Label>
              <Form.Control size="lg" type='email' value={username} onChange={ev => setUsername(ev.target.value)} />
            </Form.Group>
            <Form.Group controlId='password'>
              <Form.Label size="lg"><b>Password</b></Form.Label>
              <Form.Control size="lg" type='password' value={password} onChange={ev => setPassword(ev.target.value)} />
            </Form.Group>
            <Row className="w-100 text-center  m-0 p-0">
              <Col className="w-100 m-0 p-0" sm="5"><Button className='w-100 mt-3 btn-danger' size="lg" onClick={() => { setGoBack(true) }}>Cancel</Button></Col>
              <Col sm="2"></Col>
              <Col sm="5" className=" m-0 p-0"><Button className=' btn-success w-100 mt-3' size="lg" onClick={handleSubmit}>Login</Button></Col>
            </Row>
          </Form>
        </Container>
      </Col>
      <Col sm={3}></Col>
    </Row>
  )
}



export { LoginForm };