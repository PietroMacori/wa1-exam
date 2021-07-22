const express = require('express');
const morgan = require('morgan'); // logging middleware
const { check, validationResult } = require('express-validator'); // validation middleware
const dao = require('./dao'); // module for accessing the DB
const userDao = require('./userDao'); // module for accessing the DB for users
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions

/*** Set up Passport ***/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
    function (username, password, done) {
        userDao.getUser(username, password).then((user) => {
            if (!user)
                return done(null, false, { message: 'Incorrect username and/or password.' });

            return done(null, user);
        })
    }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
    done(null, user.adminID);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
    userDao.getUserById(id)
        .then(user => {
            done(null, user); // this will be available in req.user
        }).catch(err => {
            done(err, null);
        });
});


// init express
let app = express();
const PORT = 3001;

app = new express();

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated())
        return next();

    return res.status(401).json({ error: 'not authenticated' });
}

// set up the session
app.use(session({
    // by default, Passport uses a MemoryStore to keep track of the sessions
    secret: 'A very complex key',
    resave: false,
    saveUninitialized: false
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));


app.get('/api/:adminID/surveys', isLoggedIn, async (req, res) => {
  try {
      const out = await dao.listSurveyAdmin(req.params.adminID);
      if (out.error) {
          res.status(404).json(out);
      } else if(out[0].adminID==req.params.adminID){
          res.status(200).json(out);
      } else {
          res.status(401).send("Not authorized");
      }
  } catch (err) {
      res.status(500).end();
  }
});

app.get('/api/surveys', async (req, res) => {
    try {
        const out = await dao.allSurveys(req.params.adminID);
        if (out.error) {
            res.status(404).json(out);
        } else{
            res.json(out);
        } 
    } catch (err) {
        res.status(500).end();
    }
  });

  

app.post('/api/:adminID/survey',isLoggedIn, 
    [
    check('title').isLength({min:1}),
    check('listQuestions').isArray({min:1})
    ],
    async(req, res)=>{
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    
    let survey = {adminID: req.params.adminID, title: req.body.title};
    let surveyID ;
    try{
        surveyID = await dao.createSurvey(survey);
        let questions = req.body.listQuestions;
        for(let q of questions){
            q.surveyID = surveyID;
            if(q.answerList.length===0){
                q.answerList= null;
            }
            try{
                await dao.createQuestion(q);
            }
            catch{

                es.status(500).json({error:"cannot create survey"});
            }
    }
    res.status(200).end();
    }
    catch{
        res.status(500).json({error:"cannot create survey"});
    }
    

    return;
});



app.get('/api/:surveyID/questions' ,async (req, res) => {
    try {
        const out = await dao.listQuestions(req.params.surveyID);
  
        if (out.error) {
            res.status(404).json(out);
        } else{
            res.json(out);
        }
        
    } catch (err) {
        res.status(500).end();
    }
  });



  app.post('/api/response/:surveyID', async(req, res)=>{
    const errors = validationResult(req);

   let nextUser = await dao.getHighestIdUser();
    try{
        for(let elem of req.body){
            const r = await dao.addResponse(elem,nextUser+1);
        }
        res.status(200).end();
    }
    catch{
        console.log("error")

        res.status(500).json({error:"cannot add response"});
    }
    return;
});


app.get('/api/:adminID/:surveyID/:userID',isLoggedIn, async (req, res) => {
    try {
        const out = await dao.listResponseByUser(req.params.surveyID, req.params.userID);
        if (out.error) {
            res.status(404).json(out);
        } else {
            res.json(out);
        }
    } catch (err) {
        res.status(500).end();
    }
})


app.get('/api/:surveyID/users', async (req, res) => {
    try {
        const out = await dao.listUserResponse(req.params.surveyID);
        if (out.error) {
            res.status(404).json(out);
        } else{
            res.json(out);
        }
    } catch (err) {
        res.status(500).end();
    }
})


// POST /login 
// login
app.post('/api/login', function (req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err){
            return next(err);}
        if (!user) {
            // display wrong login messages
            return res.status(401).json(info);
        }
        // success, perform the login
        req.login(user, (err) => {
            if (err)
                return next(err);

            // req.user contains the authenticated user, we send all the user info back
            // this is coming from userDao.getUser()
            return res.json(req.user);
        });
    })(req, res, next);
});

// DELETE /login/current 
// logout
app.delete('/api/login/current', (req, res) => {
    req.logout();
    res.end();
});

// GET /login/current
// check whether the user is logged in or not
app.get('/api/login/current', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json(req.user);
    }
    else
        res.status(401).json({ error: 'Unauthenticated user!' });;
});