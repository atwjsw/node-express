var mongoose = require('mongoose');
var Orders = require('./orders.js');
var customerSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zip: String,
    phone: String,
    salesNotes: [{
        date: Date,
        salespersonId: Number,
        notes: String,
    }],
});
customerSchema.methods.getOrders = function() {
    return Orders.find({ customerId: this._id });
};
var Customer = mongoose.model('Customer', customerSchema);
modules.export = Customer;

// 我建议你在项目中创建一个叫models 的子目录来存放模型。只要你有要实现的逻辑，或要
// 存储的数据，都应该在models 目录下的文件里完成。比如说，你可能要把客户数据和逻辑
// 放在文件models/customer.js 中