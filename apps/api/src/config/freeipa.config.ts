import { Client } from "ldapjs";
import * as fs from "fs";
import * as path from "path";

const cerPath = path.join(__dirname, "../../cert/ca.crt");
const client = new Client({
    url: "ldaps://iam.allware.cl:636",
    tlsOptions: {
        ca: [fs.readFileSync(cerPath)],
        rejectUnauthorized: true,
    },
});