const express = require('express');
const app =express();
const bodyParser = require('body-parser');
const { urlencoded } = require('express');
app.use( bodyParser.urlencoded({extended: true}));
const MongoClient = require('mongodb').MongoClient;
const methodOverride = require('method-override')
app.use(methodOverride('_method'))
app.set('view engine','ejs');


app.use(express.static('public'))
var db;
MongoClient.connect('mongodb+srv://leejiyoung:ofz9d2zr@boilerplate.xcwv7.mongodb.net/?retryWrites=true&w=majority',
function (에러, client) {
	if (에러) return console.log(에러)
	db = client.db('todoapp');



	app.listen(8080, function () {
		console.log('listening on 8080')
	});
});
app.get('/pet',function(요청,응답){
    응답.send('pet용품 쇼핑 할 수 있는 사이트 입니다')
});

app.get('/',function(요청,응답){
  응답.render('index.ejs');
});

app.get('/write',function(요청,응답){
  응답.render('write.ejs');
});

app.post('/add', function (요청, 응답) {
    db.collection('counter').findOne({name : '게시물갯수'}, function(에러, 결과){
      var 총게시물갯수 = 결과.totalPost
      db.collection('post').insertOne({ _id : 총게시물갯수 + 1, 제목 : 요청.body.title, 날짜 : 요청.body.date }, function (에러, 결과) {
        db.collection('counter').updateOne({name:'게시물갯수'},{ $inc: {totalPost:1} },function(에러, 결과){
      if(에러){return console.log(에러)}
          응답.send('전송완료');
        })
      })
    })
  })
app.get('/list',function(요청,응답){
 db.collection('post').find().toArray(function(에러,결과){
     console.log(결과);
     응답.render('list.ejs',{ posts:결과 });
 });
});

app.get('/search',(요청,응답)=>{
  console.log(요청.query.value);
  db.collection('post').find({제목:요청.query.value}).toArray((에러,결과)=>{
    console.log(결과);
    응답.render('search.ejs',{ posts:결과 });

  });
})

app.delete('/delete', function(요청, 응답){
    요청.body._id = parseInt(요청.body._id)
    db.collection('post').deleteOne(요청.body, function(에러, 결과){
      console.log('삭제완료');
      응답.status(200).send({ message : '성공했스무니다'});
    })
  });

  app.get('/detail/:id', function(요청, 응답){
    db.collection('post').findOne({ _id : parseInt(요청.params.id) }, function(에러, 결과){
      응답.render('detail.ejs', {data : 결과} )
    })
  });

  app.get('/edit/:id',function(요청,응답){
    db.collection('post').findOne({_id : parseInt(요청.params.id)}, function(에러,결과){
      console.log(결과)
      응답.render('edit.ejs', {post : 결과} )
    })
  })

  app.put('/edit', function(요청, 응답){ 
    db.collection('post').updateOne( {_id : parseInt(요청.body.id) }, {$set : { 제목 : 요청.body.title , 날짜 : 요청.body.date }}, 
      function(){ 
      
      console.log('수정완료') 
      응답.redirect('/list') 
    }); 
  }); 

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session()); 

app.get('/login', function (요청, 응답) {
  응답.render('login.ejs')
})

app.post('/login', passport.authenticate('local', {
  failureRedirect : '/fail'
}), function(요청, 응답){
  응답.redirect('/')
});

app.get('/mypage', 로그인했니, function (요청, 응답) {
  console.log(요청.user);
  응답.render('mypage.ejs', { 사용자: 요청.user })
}) 

function 로그인했니(요청,응답,next){
  if(요청.user){
    next()
  }else{
    응답.send('로그인안하셨는데욤?')
  }
}


passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'pw',
  session: true,
  passReqToCallback: false,
}, function (입력한아이디, 입력한비번, done) {
  // console.log(입력한아이디, 입력한비번);
  db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
    if (에러) return done(에러)

    if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
    if (입력한비번 == 결과.pw) {
      return done(null, 결과)
    } else {
      return done(null, false, { message: '비번틀렸어요' })
    }
  })
}));

passport.serializeUser(function (user, done) {
  done(null, user.id)
});

passport.deserializeUser(function (아이디, done) {
  db.collection('login').findOne({ id: 아이디 }, function (에러, 결과) {
    done(null, 결과)
  })
}); 