const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/', (req, res, next) => {
	return res.render('index.ejs');
});


router.post('/', (req, res, next) => {
	let personInfo = req.body;

	if (!personInfo.email || !personInfo.username || !personInfo.password || !personInfo.passwordConf) {
		res.send();
	} else {
		if (personInfo.password == personInfo.passwordConf) {

			User.findOne({ email: personInfo.email }, (err, data) => {
				if (!data) {
					let c;
					User.findOne({}, (err, data) => {

						if (data) {
							c = data.unique_id + 1;
						} else {
							c = 1;
						}

						let newPerson = new User({
							unique_id: c,
							email: personInfo.email,
							username: personInfo.username,
							password: personInfo.password,
							passwordConf: personInfo.passwordConf
						});

						newPerson.save((err, Person) => {
							if (err)
								console.log(err);
							else
								console.log('Sucesso');
						});

					}).sort({ _id: -1 }).limit(1);
					res.send({ "Sucesso": "Você já esta registrado, pode logar agora." });
				} else {
					res.send({ "Sucesso": "Email já em uso." });
				}

			});
		} else {
			res.send({ "Sucesso": "As senhas não conferem" });
		}
	}
});

router.get('/login', (req, res, next) => {
	return res.render('login.ejs');
});

router.post('/login', (req, res, next) => {
	User.findOne({ email: req.body.email }, (err, data) => {
		if (data) {

			if (data.password == req.body.password) {
				req.session.userId = data.unique_id;
				res.send({ "Sucesso": "Sucesso!" });
			} else {
				res.send({ "Sucesso": "Senha errada!" });
			}
		} else {
			res.send({ "Success": "Esse e-mail não está registrado!" });
		}
	});
});

router.get('/profile', (req, res, next) => {
	User.findOne({ unique_id: req.session.userId }, (err, data) => {
		if (!data) {
			res.redirect('/');
		} else {
			return res.render('data.ejs', { "name": data.username, "email": data.email });
		}
	});
});

router.get('/logout', (req, res, next) => {
	if (req.session) {
		// excluir objeto de sessão
		req.session.destroy((err) => {
			if (err) {
				return next(err);
			} else {
				return res.redirect('/');
			}
		});
	}
});

router.get('/forgetpass', (req, res, next) => {
	res.render("forget.ejs");
});

router.post('/forgetpass', (req, res, next) => {
	User.findOne({ email: req.body.email }, (err, data) => {
		if (!data) {
			res.send({ "Successo": "Esse e-mail não esta registrado!" });
		} else {
			if (req.body.password == req.body.passwordConf) {
				data.password = req.body.password;
				data.passwordConf = req.body.passwordConf;

				data.save((err, Person) => {
					if (err)
						console.log(err);
					else
						console.log('Successo');
					res.send({ "Successo": "Senha alterada!" });
				});
			} else {
				res.send({ "Successo": "A senha não corresponde! Ambas as senhas devem ser iguais." });
			}
		}
	});

});

module.exports = router;