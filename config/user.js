var mongoose = require('mongoose');
var User = mongoose.model('User', {
	name:String,
	passwordHash:String
})


module.exports = User;