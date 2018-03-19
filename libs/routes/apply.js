var express = require('express');
var router = express.Router();

var libs = process.cwd() + '/libs/';

var log = require(libs + 'controllers/log')(module);
var WolfApply = require(libs + 'model/wolfApply');
var flag='false';

router.get('/', function(req, res) {
    res.render('apply-v2',{info:req.flash('info'),error:req.flash('error')});
});

//get all applicants list
router.get('/game',  function(req, res) {
	
	WolfApply.find(function (err, wolfapplies) {
		if (!err) {

			return res.json(wolfapplies);
			

		} else {
			res.statusCode = 500;
			
			log.error('Internal error(%d): %s',res.statusCode,err.message);
			
			return res.json({ 
				error: 'Server error' 
			});
		}
	});
});

//post an applicant to DB
router.post('/game',  function(req, res) {

	var wolfApply = new WolfApply({
		firstName: req.body.first_name.toLowerCase(),
		lastName: req.body.last_name.toLowerCase(),
		email: req.body.first_name.toLowerCase()+'.'+req.body.last_name.toLowerCase()+'@ehealth.com'

	});

	console.log(wolfApply);

	wolfApply.save(function (err) {
		if (!err) {
			log.info("New application created with id: %s", wolfApply.id);

			req.flash('info', 'Your application has been submitted successfully.')
			console.log(req.url);
			// res.render('apply-v2', {info: req.flash('info'),error: ''} );
			flag='true';
			res.redirect('/api?flag='+flag);

		} else {
			if(err.name === 'ValidationError') {
				res.statusCode = 400;
				res.json({ 
					error: 'Validation error' 
				});
			} else {
				res.statusCode = 500;
				
				log.error('Internal error(%d): %s', res.statusCode, err.message);
				
				// res.json({ 
				// 	error: 'Server error' 
				// });
				req.flash('error', 'You have already submitted.')
				// res.render('apply-v2', {info:'', error: req.flash('error') });
				flag='false';
				res.redirect('/api?flag='+flag);

			}
		}
	});
});

//get an specific applicant by id 
router.get('/game/:id',  function(req, res) {
	
	WolfApply.findById(req.params.id, function (err, wolfApply) {
		
		if(!wolfApply) {
			res.statusCode = 404;
			
			return res.json({ 
				error: 'Not found' 
			});
		}
		
		if (!err) {
			return res.json({ 
				status: 'OK', 
				wolfApply:wolfApply 
			});
		} else {
			res.statusCode = 500;
			log.error('Internal error(%d): %s',res.statusCode,err.message);
			
			return res.json({ 
				error: 'Server error' 
			});
		}
	});
});

//update an applicant by id
router.put('/game/:id',  function (req, res){
	var wolfApplyId = req.params.id;

	WolfApply.findById(wolfApplyId, function (err, wolfApply) {
		if(!wolfApply) {
			res.statusCode = 404;
			log.error('WolfApply with id: %s Not Found', wolfApplyId);
			return res.json({ 
				error: 'Not found' 
			});
		}

		wolfApply.firstName = req.body.first_name;
		wolfApply.lastName = req.body.last_name;
		wolfApply.email = req.body.first_name+'.'+req.body.last_name+'@ehealth.com';
		
		wolfApply.save(function (err) {
			if (!err) {
				log.info("WolfApply with id: %s updated", wolfApply.id);
				return res.json({ 
					status: 'OK', 
					wolfApplyId:wolfApplyId 
				});
			} else {
				if(err.name === 'ValidationError') {
					res.statusCode = 400;
					return res.json({ 
						error: 'Validation error' 
					});
				} else {
					res.statusCode = 500;
					
					return res.json({ 
						error: 'Server error' 
					});
				}
				log.error('Internal error (%d): %s', res.statusCode, err.message);
			}
		});
	});
});

module.exports = router;
