const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const { restart } = require('nodemon');


const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      port : 3306,
      user : 'kristina',
      password : '123',
      database : 'smartbrain'
    }
  });


const app = express();

app.use(bodyParser.json()); 
app.use(cors());

/* const database = {
    users: [
        {
            id:'123',
            name:'John',
            email:'john@gmail.com',
            password:'cookies',
            entries:0,
            joined: new Date()
        },
        {
            id:'124',
            name:'Sally',
            email:'sally@gmail.com',
            password:'pasta',
            entries:0,
            joined: new Date()
        }
    ],
    login:[ {
        id: '987',
        hash: '',
        email: 'john@gmail.com'
    }
    ]
} */

app.get('/', (req, res) => {
    res.send(db.users);
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
    // let found = false;
    // database.users.forEach(user => {
    //     if (user.id === id) {
    //         found = true;
    //         user.entries++;
    //         return res.json(user.entries);
    //     }
    // })
    // if (!found) {
    //     res.status(400).json('not found');
    // } 



// // Load hash from your password DB.
// bcrypt.compare("bacon", hash, function(err, res) {
//     // res == true
// });
// bcrypt.compare("veggies", hash, function(err, res) {
//     // res = false
// });



app.listen(3000, () => {
    console.log('app is running on port 3000');
});

