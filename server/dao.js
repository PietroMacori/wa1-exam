'use strict';
/* Data Access Object (DAO) module for accessing survey, question, answers */

const sqlite = require('sqlite3');

// open the database
const db = new sqlite.Database('./database.db', (err) => {
  if (err) throw err;
});


// get all surveys
exports.listSurveyAdmin = (adminID) => {
  return new Promise( (resolve, reject) => {
    const sql = 'SELECT * FROM Survey WHERE adminID=?';
    db.all(sql, [adminID], async (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      let listNum=[]
      let i=0;
      for(let elem of rows){
        let ret = await getRespNumber(elem.surveyID);
        listNum[i]=ret;
        i++;
      }
      i=0;
      const survey = rows.map((t) => ({ surveyID: t.surveyID, adminID: t.adminID, title: t.title, numResp:listNum[i++]
      }));

      resolve(survey);
    });
  });
};



// get all surveys
exports.allSurveys = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM Survey';
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const survey = rows.map((t) => ({ surveyID: t.surveyID, adminID: t.adminID, title: t.title}));

      resolve(survey);
    });
  });
}


// create a new survey
exports.createSurvey = (s) => {
  return new Promise(async (resolve, reject) => {
    let id = await getHighestIdSurvey() + 1;
    const sql = 'INSERT INTO Survey(surveyID, adminID, title) VALUES(?, ?, ?)';
    db.run(sql, [id, s.adminID, s.title], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(id);
    });
  });
};

// get highest id of survey
const getHighestIdSurvey = () => {
  return new Promise((resolve, reject) => {

    const sql = 'SELECT count(surveyID) AS tot FROM Survey';
    db.get(sql,function (err, row) {
      if (err) {
        reject(err);
        return;
      }

      if (row.tot == 0) {
        resolve(0);
      } else {
        const sql = 'SELECT max(surveyID) as max FROM Survey';
        db.get(sql ,function (err, row) {
          if (err) {
            reject(err);
            return;
          }
          resolve(row.max);
        });
      }
    });
  })
};





// create a new survey
exports.createQuestion = (q) => {
  return new Promise(async (resolve, reject) => {
    let id = await getHighestIdQuestion() + 1;
    const sql = 'INSERT INTO Question(questionID, surveyID,text, open, max, min, answerList) VALUES(?, ?, ?, ? , ?,?,?)';
    db.run(sql, [id, q.surveyID, q.text, q.open, q.max, q.min, q.answerList], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(id);
    });
  });
};


// get highest id of questions
const getHighestIdQuestion = () => {
  return new Promise((resolve, reject) => {

    const sql = 'SELECT count(questionID) AS tot FROM Question';
    db.get(sql,function (err, row) {
      if (err) {
        reject(err);
        return;
      }

      if (row.tot == 0) {
        resolve(0);
      } else {
        const sql = 'SELECT max(questionID) as max FROM Question';
        db.get(sql ,function (err, row) {
          if (err) {
            reject(err);
            return;
          }
          resolve(row.max);
        });
      }
    });
  })
};

// get all questions of a survey
exports.listQuestions = (surveyID) => {
  return new Promise((resolve, reject) => {

    const sql = 'SELECT * FROM Question WHERE surveyID=?';
    db.all(sql, [surveyID], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const survey = rows.map((t) => ({ questionID: t.questionID,surveyID: t.surveyID, text:t.text, open:t.open, max:t.max, min:t.min ,answerList: t.answerList}));

      resolve(survey);
    });
  });
};

// get if question is open or closed
 const getQuestion = (questionID) => {
  return new Promise((resolve, reject) => {

    const sql = 'SELECT * FROM Question WHERE questionID=?';
    db.get(sql, [questionID], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
};

// get all answers to a question of a survey
exports.listAnswers = (questionID, surveyID) => {
  
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM Answer WHERE questionID=? AND surveyID=?';
    db.all(sql, [questionID, surveyID], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const survey = rows.map((t) => ({answerID: t.answerID, questionID: t.questionID,surveyID: t.surveyID, answer: t.answer}));

      resolve(survey);
    });
  });
};



// add a new response
exports.addResponse = (r,i) => {
  return new Promise(async (resolve, reject) => {

    let id = await getHighestIdResponse() + 1;
    const sql = 'INSERT INTO Response(responseID,questionID, surveyID,response, userName,userID) VALUES(?, ?, ?, ?, ?,?)';
    db.run(sql, [id, r.questionID ,r.surveyID, r.response, r.userName,i  ], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(id);
    });
  });
};



// get highest id of response
const getHighestIdResponse = () => {
  return new Promise((resolve, reject) => {

    const sql = 'SELECT count(responseID) AS tot FROM Response';
    db.get(sql,function (err, row) {
      if (err) {
        reject(err);
        return;
      }

      if (row.tot == 0) {
        resolve(0);
      } else {
        const sql = 'SELECT max(responseID) as max FROM Response';
        db.get(sql ,function (err, row) {
          if (err) {
            reject(err);
            return;
          }
          resolve(row.max);
        });
      }
    });
  })
};


// get highest id of userID
exports.getHighestIdUser = () => {
  return new Promise((resolve, reject) => {

    const sql = 'SELECT count(userID) AS tot FROM Response';
    db.get(sql,function (err, row) {
      if (err) {
        reject(err);
        return;
      }

      if (row.tot == 0) {
        resolve(0);
      } else {
        const sql = 'SELECT max(userID) as max FROM Response';
        db.get(sql ,function (err, row) {
          if (err) {
            reject(err);
            return;
          }
          resolve(row.max);
        });
      }
    });
  })
};


// get all answers to a given survey
exports.listResponseByUser = (surveyID,userID) => {
  return new Promise( (resolve, reject) => {
    const sql = 'SELECT * FROM Response WHERE surveyID=? AND userID=? ';
    db.all(sql, [surveyID,userID], async(err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      let res = [];
      for(let i=0; i<rows.length; i++){
        let qu = await getQuestion(rows[i].questionID)
        res[i]={
          responseID : rows[i].responseID,
          questionID : rows[i].questionID,
          surveyID : rows[i].surveyID,
          response : rows[i].response,
          question : qu.text,
          userName : rows[i].userName,
          open: qu.open
        }
      }
      resolve(res);
    });
  });
};

// get all userId that responde to a given survey
exports.listUserResponse = (surveyID) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT DISTINCT userID FROM Response WHERE surveyID=?';
    db.all(sql, [surveyID], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      resolve(rows);
    });
  });
};


// get number of responses for a given Survey
const getRespNumber = (surveyID) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT DISTINCT userID FROM Response WHERE surveyID=?';
    db.all(sql, [surveyID], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows.length);
    });
  });
};