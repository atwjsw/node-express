// 联合各域的辅助函数
function smartJoin(arr, separator) {
    if (!separator) separator = ' ';
    return arr.filter(function(elt) {
        return elt !== undefined &&
            elt !== null &&
            elt.toString().trim() !== '';
    }).join(separator);
}

module.exports = function(customerId) {
    var customer = Customer.findById(customerId);
    if (!customer) return {
        error: 'Unknown customer ID: ' +
            req.params.customerId
    };
    var orders = customer.getOrders().map(function(order) {
        return {
            orderNumber: order.orderNumber,
            date: order.date,
            status: order.status,
            url: '/orders/' + order.orderNumber,
        };
    });
    var vm = _.omit(customer, 'salesNotes');
    return _.extend(vm, {
        name: smartJoin([vm.firstName, vm.lastName]),
        fullAddress: smartJoin([
            customer.address1,
            customer.address2,
            customer.city + ', ' +
            customer.state + ' ' +
            customer.zip,
        ], '<br>'),
        orders: customer.getOrders().map(function(order) {
            return {
                orderNumber: order.orderNumber,
                date: order.date,
                status: order.status,
                url: '/orders/' + order.orderNumber,
            };
        }),
    });
};
