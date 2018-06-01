const Fabric = require('react-native-fabric')

const { Crashlytics } = Fabric

/**
 * This method is almost copied from react-native-fabric.
 * But that version creates an error object which is sent to the native side
 * via recordError(), which for some reason does not exist on Android currently.
 * To mitigate this problem without forking react-native-fabric, this version
 * of the function creates a string error, and it logs it with Crashlytics.log(),
 * which both platforms have.
 */

const errorAsString = function(error) {
    var errorString;

    if (typeof error === "string" || error instanceof String) {
      errorString = `Error: ${error}`;
    }
    else if (typeof error === "number") {
      errorString = `Error code: ${error}`
    }
    else if (typeof error === "object") {
      errorString = {}; // will stringify in the end

      // Pass everything in as a string or number to be safe
      for (var k in error) {
        if (error.hasOwnProperty(k)) {
          if (((typeof error[k]) !== "number") && ((typeof error[k]) !== "string") && !(error[k] instanceof String)) {
            errorString[k] = JSON.stringify(error[k]);
          }
          else {
            errorString[k] = error[k]
          }
        }
      }
      errorString = `Error: ${JSON.stringify(errorString)}`
    }
    else {
      // Array?
      // Fall back on JSON
      errorString = `Error: ${JSON.stringify(error)}`
    }
    return errorString;
}

const logToCrashlyticsFunction = function(level) {
    return function(error) {
        errorString = `${level}: ${error}`
        Crashlytics.log(errorString);
    }
}

const chainFunction = function(console, methodName, logFunction) {
    if (console[methodName]) {
        const original = console[methodName]
        console[methodName] = function(error) {
            let errorString = errorAsString(error);
            logFunction(errorString)
            return original(errorString)
        }
    }
}

const init = function(console) {
    const errorToCrashlytics = logToCrashlyticsFunction('E')
    const logToCrashlytics = logToCrashlyticsFunction('L')
    const warnToCrashlytics = logToCrashlyticsFunction('W')
    const infoToCrashlytics = logToCrashlyticsFunction('I')

    chainFunction(console, 'error', errorToCrashlytics)
    chainFunction(console, 'log', logToCrashlytics)
    chainFunction(console, 'warn', warnToCrashlytics)
    chainFunction(console, 'info', infoToCrashlytics)
}

module.exports.init = init
