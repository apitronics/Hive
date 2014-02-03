var df = require('node-diskfree');

/* retrieve disks list */
df.drives(
    function (err, drives) {
        if (err) {
            return console.log(err);
        }

        /* retrieve space information for each drives */
        df.drivesDetail(
            drives,
            function (err, data) {
                if (err) {
                    return console.log(err);
                }

                console.log(data);
            }
        );

        /* or retrieve space information for on drive */
        df.driveDetail(
            drives[0],
            function (err, data) {
                if (err) {
                    return console.log(err);
                }

                console.log(data);
            }
        );
    }
);
