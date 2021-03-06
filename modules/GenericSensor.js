// Copyright (c) 2016-2018, Intel Corporation.

// JavaScript library for the tests sensor case

function GenericSensor() {

    // API object
    var genericSensor = {};

    var total = 0;
    var pass = 0;

    function assert(actual, description) {
        if (typeof actual !== "boolean" ||
            typeof description !== "string") {
            console.log("AssertionError: invalid input type given");
            throw new Error();
            return;
        }

        total++;

        var label = "\033[1m\033[31mFAIL\033[0m";
        if (actual === true) {
            pass++;
            label = "\033[1m\033[32mPASS\033[0m";
        }

        console.log(label + " - " + description);
    }

    function throws(description, func) {
        if (typeof description !== "string" ||
            typeof func !== "function") {
            console.log("AssertionError: invalid input type given");
            throw new Error();
            return;
        }

        var booleanValue = false;

        try {
            func();
        }
        catch (err) {
            booleanValue = true;
        }

        assert(booleanValue, description);
    }

    function result() {
        console.log("TOTAL: " + pass + " of "
                    + total + " passed");
    }

    var isActivated = false;
    var changeFlag = false;
    var errorFlag = true;
    var middleNum, middleNumX, middleNumY, middleNumZ, tmpTimestamp;

    genericSensor.test = function(sensor, sensorType) {
        assert(typeof sensor === "object" && sensor !== null,
               "sensor: be defined");

        isActivated = sensor.activated;
        assert(typeof isActivated === "boolean",
               "sensor: activated as " + isActivated);
        console.log("activated: " + isActivated);

        sensor.activated = !sensor.activated;
        assert(sensor.activated === isActivated,
               "sensor: activated is readonly property ");

        sensor.onactivate = function() {
            console.log("activated: " + sensor.activated);
            assert(sensor.activated === true, "sensor: sensor is activated");
            changeFlag = true;
        };

        sensor.onreading = function() {
            tmpTimestamp = sensor.timestamp;

            if (changeFlag === true) {
                assert(typeof sensor.timestamp === "number" &&
                       sensor.timestamp !== null,
                       "sensor: timestamp value is defined");

                middleNum = sensor.timestamp;
                sensor.timestamp = middleNum + 1;
                assert(sensor.timestamp === middleNum,
                       "sensor: timestamp is readonly property");

                if (sensorType === "AmbientLight") {
                    assert(typeof sensor.illuminance === "number" &&
                           sensor.illuminance !== null,
                           "sensor: reading value for '" + sensorType + "'");

                    middleNum = sensor.illuminance;
                    sensor.illuminance = middleNum + 1;
                    assert(sensor.illuminance === middleNum,
                           "sensor: reading is readonly property");

                    console.log("sensor.timestamp: " + sensor.timestamp);
                    console.log(sensorType + ": " + sensor.illuminance);
                } else if (sensorType === "Accelerometer" ||
                           sensorType === "Gyroscope" ||
                           sensorType === "Magnetometer") {
                    assert(typeof sensor.x === "number" &&
                           sensor.x !== null &&
                           typeof sensor.y === "number" &&
                           sensor.y !== null &&
                           typeof sensor.z === "number" &&
                           sensor.z !== null,
                           "sensor: reading value for '" + sensorType + "'");

                    middleNumX = sensor.x;
                    sensor.x = middleNumX + 1;
                    middleNumY = sensor.y;
                    sensor.y = middleNumY + 1;
                    middleNumZ = sensor.z;
                    sensor.z = middleNumZ + 1;
                    assert(sensor.x === middleNumX &&
                           sensor.y === middleNumY &&
                           sensor.z === middleNumZ,
                           "sensor: reading is readonly property");

                    console.log("sensor.timestamp: " + sensor.timestamp);
                    console.log(sensorType + ": " +
                                " x=" + sensor.x +
                                " y=" + sensor.y +
                                " z=" + sensor.z);
                } else if (sensorType === "Temperature") {
                    assert(typeof sensor.celsius === "number" &&
                           sensor.celsius !== null,
                           "sensor: reading value for '" + sensorType + "'");

                    middleNum = sensor.celsius;
                    sensor.celsius = middleNum + 1;
                    assert(sensor.celsius === middleNum,
                           "sensor: reading is readonly property");

                    console.log("sensor.timestamp: " + sensor.timestamp);
                    console.log(sensorType + ": " + sensor.celsius);
                }

                changeFlag = false;
            }
        };

        sensor.onerror = function(event) {
            if (errorFlag === true) {
                assert(typeof event.error === "object",
                       "sensor: callback value for 'onerror'");

                assert(typeof event.error.name === "string" &&
                       typeof event.error.message === "string",
                       "sensor: " + event.error.name + " - " +
                       event.error.message);

                errorFlag = false;
            }
        };

        sensor.start();

        setTimeout(function() {
            assert(sensor.activated === true, "sensor: is activated");
        }, 1000);

        setTimeout(function() {
            sensor.stop();
            assert(sensor.activated === false, "sensor: is stopped");
        }, 20000);

        setTimeout(function() {
            assert(tmpTimestamp === sensor.timestamp,
                       "sensor: timestamp value is latest reading value");

            result();
        }, 25000);
    }

    return genericSensor;
};

module.exports.GenericSensor = new GenericSensor();
