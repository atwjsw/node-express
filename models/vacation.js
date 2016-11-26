var mongoose = require('mongoose');

// 这段代码声明了vacation 模型的属性，以及各个属性的类型。
var vacationSchema = mongoose.Schema({
    name: String,
    slug: String,
    category: String,
    sku: String,
    description: String,
    priceInCents: Number,
    tags: [String],
    inSeason: Boolean,
    available: Boolean,
    requiresWaiver: Boolean,
    maximumGuests: Number,
    notes: String,
    packagesSold: Number,
});

//定义模式的方法
vacationSchema.methods.getDisplayPrice = function() {
    return '$' + (this.priceInCents / 100).toFixed(2);
};

//只要有了模式，我们就可以用mongoose.model 创建模型
var Vacation = mongoose.model('Vacation', vacationSchema);

module.exports = Vacation;
