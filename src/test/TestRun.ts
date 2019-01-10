import "mocha";
import { Test } from "mocha";
import winston = require("winston");
import { Environment } from "../adapters/index";

export class TestRun {
    public static UseAdapters(): boolean {
        return Environment.UseAdapters(false);
    }

    public static AdapterTest(title: string, fn: Mocha.AsyncFunc): Test {
        const noOp = async () => {
            winston.debug("skipping test");
        };

        let test: Test;

        if (TestRun.UseAdapters()) {
            test = TestRun.SlowTest(title, fn);
        } else {
            test = it(`SKIPPED: ${title}`, noOp);
        }

        return test;
    }

    public static SlowAdapterTest(title: string, fn: Mocha.AsyncFunc): Test {
        let test: Test;

        if (TestRun.UseAdapters()) {
            test = TestRun.SlowTest(title, fn);
        } else {
            test = it(title, fn);
        }

        return test;
    }

    public static SlowTest(title: string, fn: Mocha.AsyncFunc) : Test {
        return it(title, fn)
                .timeout(25000);
    }
}