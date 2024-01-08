const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const { restart } = require('nodemon');


const db = knex({
    client: 'pg',
    connection: {
      host : 'ep-floral-snow-55675466.us-east-2.aws.neon.tech',
      port : 5432,
      user : 'kristinakasalova',
      password : 'FH6DiCqYaXl4',
      database : 'neondb'
    }
  });


const app = express();

app.use(bodyParser.json()); 
app.use(cors());

app.get('/', (req, res) => {
    res.send('it is working');
});

app.post('/signin', (req, res) => {
db.select('email', 'hash').from('login')
    .where('email','=', req.body.email)
    .then(data => {
        const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
        if (isValid){
                return db.select('*').from('users').where('email','=', req.body.email)
                .then(user => {
                    res.json(user[0])
                    .catch(err => res.status(400).json('unable to get user'))
                })  
                .catch(err => res.status(400).json('wrong credentials'))    
        }
    })
    .catch(err => res.status(400).json('wrong credentials'))    
});

app.post('/register',(req,res) => {
    const {email, name, password} = req.body;
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
            .returning('*')
            .insert({
                email: loginEmail[0].email,
                name: name,
                joined: new Date()    
            }).then(user => {
                res.json(user[0])
            }).catch(err => res.status(400).json('unable to register'))
        } )
    })    
    .then(trx.commit)
    .catch(trx.rollback)
}   )

app.get('/profile/:id',(req, res) => {
    const { id } = req.params;
        db.select('*').from('users').where({id}).then(user => {
            if (user.length){
        res.json(user[0])
        } else {
            res.status(400).json('Not found')
        }
    })
    .catch(err => res.status(400).json('error getting user'))   
})

app.put('/image', (req,res) =>{
    const { id } = req.body;
    db('users').where('id', '=', id)
    .increment('entries',1)
    .returning(entries[0].entries)
    .then(entries => res.json(entries[0].entries))
    .catch(err => res.status(400).json('unable to get entries'));
    })

app.listen(process.env.PORT || 3000, () => {
    console.log('app is running on port ${process.env.PORT}');
});

