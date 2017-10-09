const ErrorHelper = {
    handleUnhandledRejection: function () {
        console.log('Event attached : handleUnhandledRejection');
        /* When a Promise's reject is not handler, fire this */
        process.on("unhandledRejection", function (reason, promise) {
            promise
                .catch(function (e) {
                    console.log('\n unhandledRejection', e.message);
                    console.log('------------------------stackTrace:');
                    console.error(e.stack);
                    console.log('------------------------------------------------');
                    //Here we can handle some error unhandled on Promise's reject
                });
        });
    },
    handleUncaughtException: function () {
        console.log('Event attached : uncaughtException');
        process.on('uncaughtException', function (err) {
            console.log('\n ! uncaughtException : ', err.message);
            console.log('------------------------stackTrace:');
            console.log(err.stack);
            console.log('------------------------------------------------');

        });
    },
    handleRejectionHandled: function () {
        console.log('Event attached : handleRejectionHandled');

        /* When a promise's reject became from unhandled to handled, fire this
         *  can be used to implement a debugger that will show a list of unhandled promise rejections updated in real time as promises become handled.
         * */
        process.on("rejectionHandled", function (promise) {

            promise

                .catch(function (e) {
                    console.log('\n ! rejectionHandled : ', e.message);
                    console.log('------------------------stackTrace:');
                    console.error(e.stack);
                    console.log('------------------------------------------------');
                    //Here we can handle some error unhandled on Promise's reject

                });
        });
    },
    handleError: function () {
        console.log('Event attached : error');

        process.on('error', function (err) {
            console.log(err);
        });
    }
};
module.exports = ErrorHelper;