var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(callback) {
    // yay!
    console.log('connection successful');
    var kittySchema = mongoose.Schema({
        name: String
    });

    /* var silence = new Kitten({ name: 'Silence' });
     console.log(silence.name); // 'Silence'*/

    // NOTE: methods must be added to the schema before compiling it with mongoose.model()
    kittySchema.methods.speak = function() {
        var greeting = this.name ? "Meow name is " + this.name : "I don't have a name";
        console.log(greeting);
    };
    var Kitten = mongoose.model('Kitten', kittySchema);

    var fluffy = new Kitten({ name: 'fluffy' });

    fluffy.speak(); // "Meow name is fluffy"

    fluffy.save(function(err, fluffy) {
        if (err) return console.error(err);
        fluffy.speak();
    });

    Kitten.find(function(err, kittens) {
        if (err) return console.error(err);
        console.log(kittens);
    });

});
